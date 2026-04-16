import Phaser from 'phaser';
import { avatarKeys, DESK_KEYS, FURNITURE_KEYS, type CharacterName } from './assetKeys';
import { COLORS } from './palette';
import type { Agent, AgentStatus } from '@/types/state';

const AVATAR_SCALE = 0.8;
const DESK_AVATAR_OFFSET_Y = -70;
const LABEL_OFFSET_Y = -54;

const STATUS_COLORS: Record<AgentStatus, number> = {
  idle: COLORS.statusIdle,
  working: COLORS.statusWorking,
  done: COLORS.statusDone,
  checkpoint: COLORS.statusCheckpoint,
  delivering: COLORS.statusWorking,
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: 'idle',
  working: 'working',
  done: 'done',
  checkpoint: 'checkpoint',
  delivering: 'delivering',
};

export class AgentEntity {
  private scene: Phaser.Scene;
  private deskX: number;
  private deskY: number;
  private deskTable: Phaser.GameObjects.Image;
  private deskShadow: Phaser.GameObjects.Graphics;
  private desk: Phaser.GameObjects.Image;
  private coffeeMug: Phaser.GameObjects.Image;
  private avatar: Phaser.GameObjects.Image;
  private focusRing: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private badgeBg: Phaser.GameObjects.Graphics;
  private statusDot: Phaser.GameObjects.Graphics;
  private statusText: Phaser.GameObjects.Text;
  private animTimer?: Phaser.Time.TimerEvent;
  private returnTimer?: Phaser.Time.TimerEvent;
  private moveTween?: Phaser.Tweens.Tween;
  private agent: Agent;
  private characterName: CharacterName;
  private deskVariant: 'black' | 'white';
  private avatarDisplayH = 0;
  private isMoving = false;
  private nearby = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    characterName: CharacterName,
    deskVariant: 'black' | 'white',
    agent: Agent,
  ) {
    this.scene = scene;
    this.deskX = x;
    this.deskY = y;
    this.agent = agent;
    this.characterName = characterName;
    this.deskVariant = deskVariant;

    this.avatar = scene.add.image(x, y + DESK_AVATAR_OFFSET_Y, this.getAvatarKey(agent.status))
      .setOrigin(0.5, 0.5)
      .setScale(AVATAR_SCALE)
      .setDepth(y);
    this.avatarDisplayH = this.avatar.displayHeight;

    this.focusRing = scene.add.graphics().setDepth(y - 1);
    this.deskTable = scene.add.image(x, y, FURNITURE_KEYS.deskWood)
      .setOrigin(0.5, 0.5)
      .setScale(1.3)
      .setDepth(y + 1);
    this.desk = scene.add.image(x, y - 30, this.getDeskKey(agent.status))
      .setOrigin(0.5, 0.5)
      .setScale(1.3)
      .setDepth(y + 2);
    this.coffeeMug = scene.add.image(x + 42, y + 8, FURNITURE_KEYS.coffeeMug)
      .setOrigin(0.5, 1)
      .setScale(1.4)
      .setDepth(y + 3);
    this.deskShadow = scene.add.graphics().setDepth(y - 2);

    this.badgeBg = scene.add.graphics().setDepth(900);
    this.nameText = scene.add.text(x, y + LABEL_OFFSET_Y, agent.name, {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4,
      resolution: 2,
    }).setOrigin(0.5, 1).setDepth(901);
    this.statusDot = scene.add.graphics().setDepth(901);
    this.statusText = scene.add.text(x, y + LABEL_OFFSET_Y + 4, STATUS_LABELS[agent.status], {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: this.getStatusHexColor(agent.status),
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3,
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(901);

    this.syncFloatingUi();
    this.startAnimation();
  }

  get id(): string {
    return this.agent.id;
  }

  get currentX(): number {
    return this.avatar.x;
  }

  get currentY(): number {
    return this.avatar.y;
  }

  get deskAvatarPoint(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.deskX, this.deskY + DESK_AVATAR_OFFSET_Y);
  }

  containsPoint(x: number, y: number, maxDistance = 76): boolean {
    return Phaser.Math.Distance.Between(this.avatar.x, this.avatar.y, x, y) <= maxDistance;
  }

  setNearby(isNearby: boolean): void {
    if (this.nearby === isNearby) return;
    this.nearby = isNearby;
    this.drawFocusRing();
    this.syncFloatingUi();
  }

  updateAgent(agent: Agent, idleTarget?: Phaser.Math.Vector2): void {
    const previousStatus = this.agent.status;
    this.agent = agent;
    this.nameText.setText(agent.name);
    this.statusText.setText(STATUS_LABELS[agent.status]);
    this.statusText.setColor(this.getStatusHexColor(agent.status));
    this.desk.setTexture(this.getDeskKey(agent.status));
    this.syncFloatingUi();

    if (previousStatus !== agent.status) {
      this.refreshBehavior(idleTarget);
    }
  }

  refreshBehavior(idleTarget?: Phaser.Math.Vector2): void {
    this.moveTween?.stop();
    this.returnTimer?.destroy();
    this.isMoving = false;

    if (this.agent.status === 'idle' && idleTarget) {
      const delay = Phaser.Math.Between(500, 1800);
      this.returnTimer = this.scene.time.delayedCall(delay, () => this.startIdleExcursion(idleTarget));
      return;
    }

    this.moveAvatarTo(this.deskX, this.deskY + DESK_AVATAR_OFFSET_Y, 420);
  }

  walkTo(target: Phaser.Math.Vector2, duration = 900, onComplete?: () => void): void {
    this.moveTween?.stop();
    this.returnTimer?.destroy();
    this.isMoving = false;
    this.moveAvatarTo(target.x, target.y, duration, onComplete);
  }

  returnToDesk(duration = 700, onComplete?: () => void): void {
    const deskPoint = this.deskAvatarPoint;
    this.walkTo(deskPoint, duration, onComplete);
  }

  private startIdleExcursion(target: Phaser.Math.Vector2): void {
    this.moveAvatarTo(target.x, target.y, 900, () => {
      this.returnTimer = this.scene.time.delayedCall(1400, () => {
        this.moveAvatarTo(this.deskX, this.deskY + DESK_AVATAR_OFFSET_Y, 850);
      });
    });
  }

  private moveAvatarTo(x: number, y: number, duration: number, onComplete?: () => void): void {
    this.moveTween?.stop();
    const keys = avatarKeys(this.characterName);

    this.isMoving = true;
    this.moveTween = this.scene.tweens.add({
      targets: this.avatar,
      x,
      y,
      duration,
      ease: 'Sine.easeInOut',
      onStart: () => this.setAvatarFrame(keys.wave1),
      onUpdate: () => {
        this.avatar.setDepth(this.avatar.y);
        this.syncFloatingUi();
        this.drawFocusRing();
      },
      onComplete: () => {
        this.isMoving = false;
        this.setAvatarFrame(this.getAvatarKey(this.agent.status));
        this.syncFloatingUi();
        this.drawFocusRing();
        onComplete?.();
      },
    });
  }

  private getStatusHexColor(status: AgentStatus): string {
    const num = STATUS_COLORS[status] ?? COLORS.statusIdle;
    return `#${num.toString(16).padStart(6, '0')}`;
  }

  private getDeskKey(status: AgentStatus): string {
    if (status === 'idle' || status === 'done') {
      return this.deskVariant === 'black' ? DESK_KEYS.blackIdle : DESK_KEYS.whiteIdle;
    }
    return this.deskVariant === 'black' ? DESK_KEYS.blackCoding : DESK_KEYS.whiteCoding;
  }

  private getAvatarKey(status: AgentStatus): string {
    const keys = avatarKeys(this.characterName);
    if (status === 'done') return keys.wave1;
    if (status === 'idle') return keys.blink;
    return keys.talk;
  }

  private drawFocusRing(): void {
    this.focusRing.clear();
    if (!this.nearby) return;

    this.focusRing.lineStyle(2, 0x00d4ff, 0.85);
    this.focusRing.fillStyle(0x00d4ff, 0.12);
    this.focusRing.fillEllipse(this.avatar.x, this.avatar.y + 18, 42, 16);
    this.focusRing.strokeEllipse(this.avatar.x, this.avatar.y + 18, 42, 16);
  }

  private syncFloatingUi(): void {
    const badgeX = this.avatar.x;
    const badgeY = this.avatar.y + LABEL_OFFSET_Y;
    const textY = badgeY + 4;
    const statusY = textY + 18;

    this.nameText.setPosition(badgeX, textY);
    this.statusText.setPosition(badgeX, statusY);

    this.badgeBg.clear();
    const nameW = Math.max(this.nameText.width, this.statusText.width + 18);
    const bgW = nameW + 20;
    const bgH = 44;
    this.badgeBg.fillStyle(0x1a1225, 0.95);
    this.badgeBg.fillRoundedRect(badgeX - bgW / 2, badgeY, bgW, bgH, 5);
    this.badgeBg.lineStyle(1, this.nearby ? 0x00d4ff : 0x6a5a80, this.nearby ? 0.8 : 0.4);
    this.badgeBg.strokeRoundedRect(badgeX - bgW / 2, badgeY, bgW, bgH, 4);

    this.statusDot.clear();
    const dotColor = STATUS_COLORS[this.agent.status] ?? COLORS.statusIdle;
    const textW = Math.max(this.statusText.width, 24);
    this.statusDot.fillStyle(dotColor, 1);
    this.statusDot.fillCircle(
      this.statusText.x - textW / 2 - 5,
      this.statusText.y + this.statusText.height / 2,
      3,
    );
  }

  private setAvatarFrame(key: string): void {
    this.avatar.setTexture(key);
    this.avatar.setScale(this.avatarDisplayH / this.avatar.height);
  }

  private startAnimation(): void {
    const keys = avatarKeys(this.characterName);
    let frame = 0;
    this.animTimer = this.scene.time.addEvent({
      delay: 520,
      loop: true,
      callback: () => {
        if (this.isMoving || this.agent.status === 'done') {
          frame = (frame + 1) % 2;
          this.setAvatarFrame(frame === 0 ? keys.wave1 : keys.wave2);
          return;
        }

        if (this.agent.status === 'idle') {
          frame = (frame + 1) % 2;
          this.setAvatarFrame(frame === 0 ? keys.blink : keys.talk);
          return;
        }

        frame = (frame + 1) % 2;
        this.setAvatarFrame(frame === 0 ? keys.talk : keys.blink);
      },
    });
  }

  destroy(): void {
    this.animTimer?.destroy();
    this.returnTimer?.destroy();
    this.moveTween?.stop();
    this.focusRing.destroy();
    this.deskTable.destroy();
    this.deskShadow.destroy();
    this.desk.destroy();
    this.coffeeMug.destroy();
    this.avatar.destroy();
    this.nameText.destroy();
    this.badgeBg.destroy();
    this.statusDot.destroy();
    this.statusText.destroy();
  }
}
