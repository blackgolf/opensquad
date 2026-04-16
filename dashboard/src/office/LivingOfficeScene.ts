import Phaser from 'phaser';
import {
  CHARACTER_NAMES,
  DESK_PATHS,
  FURNITURE_PATHS,
  MALE_CHARACTERS,
  FEMALE_CHARACTERS,
  avatarKeys,
  avatarPath,
  type CharacterName,
} from './assetKeys';
import { CELL_H, CELL_W, MARGIN, WALL_H } from './palette';
import { RoomBuilder } from './RoomBuilder';
import { AgentEntity } from './AgentEntity';
import { UserAvatar } from './UserAvatar';
import { useSquadStore } from '@/store/useSquadStore';
import type { Agent, Handoff, SquadState, UserProfile } from '@/types/state';

type DashboardSceneState = {
  squadState: SquadState | null;
  userProfile: UserProfile | null;
};

const DEMO_AGENTS: Agent[] = [
  { id: '1', name: 'Researcher', icon: '', status: 'working', gender: 'female', desk: { col: 1, row: 1 } },
  { id: '2', name: 'Writer', icon: '', status: 'idle', gender: 'male', desk: { col: 2, row: 1 } },
  { id: '3', name: 'Editor', icon: '', status: 'done', gender: 'female', desk: { col: 3, row: 1 } },
  { id: '4', name: 'Designer', icon: '', status: 'working', gender: 'female', desk: { col: 1, row: 2 } },
  { id: '5', name: 'Reviewer', icon: '', status: 'checkpoint', gender: 'male', desk: { col: 2, row: 2 } },
  { id: '6', name: 'Publisher', icon: '', status: 'idle', gender: 'male', desk: { col: 3, row: 2 } },
];

function assignCharacters(agents: Agent[]): Map<string, CharacterName> {
  const assignments = new Map<string, CharacterName>();
  let maleIndex = 0;
  let femaleIndex = 0;

  for (const agent of agents) {
    if (agent.gender === 'male') {
      assignments.set(agent.id, MALE_CHARACTERS[maleIndex % MALE_CHARACTERS.length]);
      maleIndex++;
    } else {
      assignments.set(agent.id, FEMALE_CHARACTERS[femaleIndex % FEMALE_CHARACTERS.length]);
      femaleIndex++;
    }
  }

  return assignments;
}

function normalizeAgents(inputAgents: Agent[]): Agent[] {
  const agents = inputAgents.length > 0 ? [...inputAgents] : [...DEMO_AGENTS];
  const allSameDesk = agents.length > 1 &&
    agents.every((agent) => agent.desk.col === agents[0].desk.col && agent.desk.row === agents[0].desk.row);

  if (!allSameDesk) return agents;

  const cols = Math.min(agents.length, 3);
  return agents.map((agent, index) => ({
    ...agent,
    desk: { col: (index % cols) + 1, row: Math.floor(index / cols) + 1 },
  }));
}

function buildLayout(agents: Agent[]) {
  let maxCol = 0;
  let maxRow = 0;
  for (const agent of agents) {
    maxCol = Math.max(maxCol, agent.desk.col);
    maxRow = Math.max(maxRow, agent.desk.row);
  }

  const cellW = CELL_W + 64;
  const cellH = CELL_H + 80;
  const roomW = Math.max(maxCol * cellW + MARGIN * 2, 580);
  const loungeSpace = CELL_H + 48;
  const roomH = maxRow * cellH + MARGIN * 2 + WALL_H + loungeSpace;

  return {
    roomW,
    roomH,
    cellW,
    cellH,
    spawn: new Phaser.Math.Vector2(MARGIN + 40, roomH - 90),
    idlePoints: [
      new Phaser.Math.Vector2(MARGIN + 56, WALL_H + 150),
      new Phaser.Math.Vector2(roomW - MARGIN - 48, WALL_H + 148),
      new Phaser.Math.Vector2(roomW / 2 - 100, roomH - 86),
      new Phaser.Math.Vector2(roomW / 2 + 128, roomH - 112),
      new Phaser.Math.Vector2(roomW / 2 + 175, roomH - 56),
    ],
  };
}

export class LivingOfficeScene extends Phaser.Scene {
  private roomBuilder!: RoomBuilder;
  private roomBounds = new Phaser.Geom.Rectangle(0, 0, 960, 720);
  private layout?: ReturnType<typeof buildLayout>;
  private userAvatar?: UserAvatar;
  private userProfile: UserProfile | null = null;
  private squadState: SquadState | null = null;
  private agentSprites = new Map<string, AgentEntity>();
  private characterMap = new Map<string, CharacterName>();
  private controls?: {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    wasd: Record<'W' | 'A' | 'S' | 'D' | 'E', Phaser.Input.Keyboard.Key>;
  };
  private lastNearbyAgentId: string | null = null;
  private promptText?: Phaser.GameObjects.Text;
  private lastHandoffKey: string | null = null;
  private activeHandoffKey: string | null = null;
  private handoffTrail?: Phaser.GameObjects.Graphics;
  private handoffMessage?: Phaser.GameObjects.Text;
  private ackMessage?: Phaser.GameObjects.Text;
  private handoffToken?: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'OfficeScene' });
  }

  preload(): void {
    for (const [key, path] of Object.entries(DESK_PATHS)) {
      this.load.image(key, path);
    }

    for (const name of CHARACTER_NAMES) {
      const keys = avatarKeys(name);
      this.load.image(keys.blink, avatarPath(name, 'blink'));
      this.load.image(keys.talk, avatarPath(name, 'talk'));
      this.load.image(keys.wave1, avatarPath(name, 'wave1'));
      this.load.image(keys.wave2, avatarPath(name, 'wave2'));
    }

    for (const [key, path] of Object.entries(FURNITURE_PATHS)) {
      this.load.image(key, path);
    }
  }

  create(): void {
    Object.values(this.textures.list).forEach((texture) => {
      if (texture.key !== '__DEFAULT' && texture.key !== '__MISSING') {
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    });

    this.roomBuilder = new RoomBuilder(this);
    this.controls = {
      cursors: this.input.keyboard!.createCursorKeys(),
      wasd: this.input.keyboard!.addKeys('W,A,S,D,E') as Record<'W' | 'A' | 'S' | 'D' | 'E', Phaser.Input.Keyboard.Key>,
    };

    this.promptText = this.add.text(0, 0, '', {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#d7f7ff',
      backgroundColor: '#07131f',
      padding: { x: 10, y: 6 },
      resolution: 2,
    }).setOrigin(0.5, 1).setDepth(980).setVisible(false);
    this.handoffTrail = this.add.graphics().setDepth(965);
    this.handoffMessage = this.add.text(0, 0, '', {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fff7d6',
      backgroundColor: '#432f17',
      padding: { x: 10, y: 8 },
      align: 'center',
      wordWrap: { width: 240, useAdvancedWrap: true },
      resolution: 2,
    }).setOrigin(0.5, 1).setDepth(990).setVisible(false);
    this.ackMessage = this.add.text(0, 0, '', {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#dcfffb',
      backgroundColor: '#103a38',
      padding: { x: 8, y: 6 },
      resolution: 2,
    }).setOrigin(0.5, 1).setDepth(991).setVisible(false);
    this.handoffToken = this.add.graphics().setDepth(992).setVisible(false);

    this.events.on('stateUpdate', (payload: DashboardSceneState) => this.onStateUpdate(payload));
    this.onStateUpdate({ squadState: null, userProfile: null });
  }

  update(_time: number, delta: number): void {
    if (!this.controls || !this.layout || !this.userAvatar) return;

    this.userAvatar.update(delta, {
      left: this.controls.cursors.left.isDown || this.controls.wasd.A.isDown,
      right: this.controls.cursors.right.isDown || this.controls.wasd.D.isDown,
      up: this.controls.cursors.up.isDown || this.controls.wasd.W.isDown,
      down: this.controls.cursors.down.isDown || this.controls.wasd.S.isDown,
    }, this.roomBounds);

    this.syncNearbyAgent();

    if (this.controls && Phaser.Input.Keyboard.JustDown(this.controls.wasd.E) && this.lastNearbyAgentId) {
      useSquadStore.getState().inspectAgent(this.lastNearbyAgentId);
    }
  }

  private onStateUpdate(payload: DashboardSceneState): void {
    const nextAgents = normalizeAgents(payload.squadState?.agents ?? DEMO_AGENTS);
    const nextLayout = buildLayout(nextAgents);
    const nextIds = nextAgents.map((agent) => agent.id).join('|');
    const currentIds = Array.from(this.agentSprites.keys()).join('|');
    const shouldRebuild =
      !this.layout ||
      this.layout.roomW !== nextLayout.roomW ||
      this.layout.roomH !== nextLayout.roomH ||
      nextAgents.length !== this.agentSprites.size ||
      nextIds !== currentIds;

    this.userProfile = payload.userProfile;
    this.squadState = payload.squadState;

    if (shouldRebuild) {
      this.rebuildRoom(nextAgents, nextLayout);
    } else {
      this.updateAgents(nextAgents);
    }

    this.maybeTriggerHandoff(payload.squadState?.handoff ?? null);
    this.syncUserAvatar();
    this.syncNearbyAgent();
  }

  private rebuildRoom(agents: Agent[], layout: ReturnType<typeof buildLayout>): void {
    for (const sprite of this.agentSprites.values()) {
      sprite.destroy();
    }
    this.agentSprites.clear();
    this.userAvatar?.destroy();
    this.userAvatar = undefined;
    this.children.removeAll(true);

    this.layout = layout;
    this.roomBounds = new Phaser.Geom.Rectangle(24, WALL_H + 10, layout.roomW - 48, layout.roomH - WALL_H - 28);

    this.roomBuilder.build(layout.roomW, layout.roomH);
    this.characterMap = assignCharacters(agents);

    agents.forEach((agent, index) => {
      const x = (agent.desk.col - 1) * layout.cellW + MARGIN + layout.cellW / 2;
      const y = (agent.desk.row - 1) * layout.cellH + MARGIN + WALL_H + layout.cellH / 2;
      const characterName = this.characterMap.get(agent.id)!;
      const deskVariant = index % 2 === 0 ? 'black' : 'white';
      const entity = new AgentEntity(this, x, y, characterName, deskVariant, agent);
      entity.refreshBehavior(this.pickIdleTarget(index));
      this.agentSprites.set(agent.id, entity);
    });

    this.promptText = this.add.text(0, 0, '', {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#d7f7ff',
      backgroundColor: '#07131f',
      padding: { x: 10, y: 6 },
      resolution: 2,
    }).setOrigin(0.5, 1).setDepth(980).setVisible(false);
    this.handoffTrail = this.add.graphics().setDepth(965);
    this.handoffMessage = this.add.text(0, 0, '', {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fff7d6',
      backgroundColor: '#432f17',
      padding: { x: 10, y: 8 },
      align: 'center',
      wordWrap: { width: 240, useAdvancedWrap: true },
      resolution: 2,
    }).setOrigin(0.5, 1).setDepth(990).setVisible(false);
    this.ackMessage = this.add.text(0, 0, '', {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#dcfffb',
      backgroundColor: '#103a38',
      padding: { x: 8, y: 6 },
      resolution: 2,
    }).setOrigin(0.5, 1).setDepth(991).setVisible(false);
    this.handoffToken = this.add.graphics().setDepth(992).setVisible(false);

    this.syncUserAvatar();

    const camera = this.cameras.main;
    camera.setBounds(0, 0, layout.roomW, layout.roomH);
    const userAvatar = this.userAvatar;
    if (userAvatar) {
      const followTarget = (userAvatar as UserAvatar).followTarget;
      camera.startFollow(followTarget, true, 0.08, 0.08);
      camera.setZoom(1.45);
    } else {
      const scaleX = camera.width / (layout.roomW + 32);
      const scaleY = camera.height / (layout.roomH + 32);
      camera.setZoom(Math.min(scaleX, scaleY, 2));
      camera.centerOn(layout.roomW / 2, layout.roomH / 2);
    }
  }

  private updateAgents(agents: Agent[]): void {
    agents.forEach((agent, index) => {
      const sprite = this.agentSprites.get(agent.id);
      sprite?.updateAgent(agent, this.pickIdleTarget(index));
    });
  }

  private syncUserAvatar(): void {
    if (!this.layout) return;

    if (!this.userProfile) {
      this.userAvatar?.destroy();
      this.userAvatar = undefined;
      this.cameras.main.stopFollow();
      return;
    }

    if (!this.userAvatar) {
      this.userAvatar = new UserAvatar(
        this,
        this.layout.spawn.x,
        this.layout.spawn.y,
        this.userProfile.avatar as CharacterName,
        this.userProfile.name,
      );
      this.cameras.main.startFollow((this.userAvatar as UserAvatar).followTarget, true, 0.08, 0.08);
      this.cameras.main.setZoom(1.45);
    }
  }

  private syncNearbyAgent(): void {
    if (!this.userAvatar) {
      this.promptText?.setVisible(false);
      return;
    }

    let nearby: AgentEntity | null = null;
    for (const sprite of this.agentSprites.values()) {
      const isNearby = sprite.containsPoint(this.userAvatar.x, this.userAvatar.y);
      sprite.setNearby(isNearby);
      if (isNearby && !nearby) nearby = sprite;
    }

    const nextNearbyId = nearby?.id ?? null;
    if (this.lastNearbyAgentId !== nextNearbyId) {
      this.lastNearbyAgentId = nextNearbyId;
      useSquadStore.getState().setNearbyAgent(nextNearbyId);
    }

    if (nearby && this.promptText) {
      const squadAgent = this.squadState?.agents.find((agent) => agent.id === nearby.id);
      const label = squadAgent?.name ?? 'agente';
      this.promptText
        .setText(`Pressione E para falar com ${label}`)
        .setPosition(nearby.currentX, nearby.currentY - 102)
        .setVisible(true);
    } else {
      this.promptText?.setVisible(false);
    }
  }

  private pickIdleTarget(index: number): Phaser.Math.Vector2 | undefined {
    if (!this.layout) return undefined;
    return this.layout.idlePoints[index % this.layout.idlePoints.length];
  }

  private maybeTriggerHandoff(handoff: Handoff | null): void {
    if (!handoff) {
      this.lastHandoffKey = null;
      return;
    }

    const nextKey = `${handoff.from}|${handoff.to}|${handoff.completedAt}|${handoff.message}`;
    if (nextKey === this.lastHandoffKey || nextKey === this.activeHandoffKey) return;

    this.lastHandoffKey = nextKey;
    const fromAgent = this.resolveAgentEntity(handoff.from);
    const toAgent = this.resolveAgentEntity(handoff.to);
    if (!fromAgent || !toAgent) return;

    this.playHandoffSequence(nextKey, handoff, fromAgent, toAgent);
  }

  private playHandoffSequence(
    handoffKey: string,
    handoff: Handoff,
    fromAgent: AgentEntity,
    toAgent: AgentEntity,
  ): void {
    this.activeHandoffKey = handoffKey;

    this.drawHandoffTrail(fromAgent.currentX, fromAgent.currentY, toAgent.currentX, toAgent.currentY);
    this.showHandoffMessage(handoff.message, (fromAgent.currentX + toAgent.currentX) / 2, Math.min(fromAgent.currentY, toAgent.currentY) - 18);
    const meeting = this.computeMeetingPoints(fromAgent, toAgent);

    let arrivals = 0;
    const onArrive = () => {
      arrivals += 1;
      if (arrivals < 2) return;

      this.animateHandoffToken(meeting.from, meeting.to);
      toAgent.reactToHandoff();
      this.showAckMessage(meeting.to.x, meeting.to.y - 72);
      this.tweens.add({
        targets: this.handoffTrail,
        alpha: { from: 1, to: 0.35 },
        duration: 280,
        yoyo: true,
        repeat: 2,
      });

      this.time.delayedCall(1200, () => {
        let returned = 0;
        const onReturn = () => {
          returned += 1;
          if (returned < 2) return;
          this.hideHandoffVisuals();
          this.activeHandoffKey = null;
        };

        fromAgent.returnToDesk(850, onReturn);
        toAgent.returnToDesk(760, onReturn);
      });
    };

    fromAgent.walkTo(meeting.from, 900, onArrive);
    toAgent.walkTo(meeting.to, 760, onArrive);
  }

  private computeMeetingPoints(fromAgent: AgentEntity, toAgent: AgentEntity) {
    const fromDesk = fromAgent.deskAvatarPoint;
    const toDesk = toAgent.deskAvatarPoint;
    const centerX = (fromDesk.x + toDesk.x) / 2;
    const centerY = (fromDesk.y + toDesk.y) / 2 + 8;

    const horizontalBias = fromDesk.x <= toDesk.x ? 34 : -34;

    return {
      from: new Phaser.Math.Vector2(centerX - horizontalBias, centerY),
      to: new Phaser.Math.Vector2(centerX + horizontalBias, centerY),
    };
  }

  private drawHandoffTrail(fromX: number, fromY: number, toX: number, toY: number): void {
    const trail = this.handoffTrail;
    if (!trail) return;

    trail.setAlpha(1);
    trail.clear();
    trail.lineStyle(4, 0xffbb22, 0.92);
    trail.beginPath();
    trail.moveTo(fromX, fromY + 8);
    trail.lineTo(toX, toY + 8);
    trail.strokePath();

    trail.fillStyle(0xffe08a, 1);
    trail.fillTriangle(toX + 10, toY + 8, toX - 8, toY + 2, toX - 8, toY + 14);
  }

  private showHandoffMessage(message: string, x: number, y: number): void {
    if (!this.handoffMessage) return;

    const clippedMessage = message.length > 120 ? `${message.slice(0, 117)}...` : message;
    this.handoffMessage
      .setText(`Handoff em curso\n${clippedMessage}`)
      .setPosition(x, y)
      .setVisible(true)
      .setAlpha(0);

    this.tweens.add({
      targets: this.handoffMessage,
      alpha: 1,
      duration: 220,
      ease: 'Quad.easeOut',
    });
  }

  private hideHandoffVisuals(): void {
    if (this.handoffTrail) {
      this.tweens.add({
        targets: this.handoffTrail,
        alpha: 0,
        duration: 240,
        onComplete: () => this.handoffTrail?.clear(),
      });
    }

    if (this.handoffMessage) {
      this.tweens.add({
        targets: this.handoffMessage,
        alpha: 0,
        duration: 220,
        onComplete: () => this.handoffMessage?.setVisible(false),
      });
    }

    if (this.ackMessage) {
      this.tweens.add({
        targets: this.ackMessage,
        alpha: 0,
        duration: 180,
        onComplete: () => this.ackMessage?.setVisible(false),
      });
    }

    this.hideHandoffToken();
  }

  private showAckMessage(x: number, y: number): void {
    if (!this.ackMessage) return;

    this.ackMessage
      .setText('Recebido. Vou assumir daqui.')
      .setPosition(x, y)
      .setVisible(true)
      .setAlpha(0);

    this.tweens.add({
      targets: this.ackMessage,
      alpha: 1,
      y: y - 8,
      duration: 180,
      ease: 'Quad.easeOut',
    });
  }

  private animateHandoffToken(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2): void {
    const token = this.handoffToken;
    if (!token) return;

    const proxy = { t: 0 };
    token.setVisible(true);
    token.setAlpha(1);

    this.tweens.add({
      targets: proxy,
      t: 1,
      duration: 320,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        const x = Phaser.Math.Linear(from.x, to.x, proxy.t);
        const y = Phaser.Math.Linear(from.y - 10, to.y - 10, proxy.t) - Math.sin(proxy.t * Math.PI) * 14;
        this.drawHandoffToken(x, y, proxy.t);
      },
      onComplete: () => {
        this.tweens.add({
          targets: token,
          alpha: 0,
          duration: 120,
          onComplete: () => token.setVisible(false),
        });
      },
    });
  }

  private drawHandoffToken(x: number, y: number, t: number): void {
    const token = this.handoffToken;
    if (!token) return;

    token.clear();
    token.fillStyle(0xfff3c4, 0.95);
    token.lineStyle(2, 0xb67d14, 1);
    token.fillRoundedRect(x - 10, y - 7, 20, 14, 3);
    token.strokeRoundedRect(x - 10, y - 7, 20, 14, 3);

    token.lineStyle(2, 0xd7a94d, 0.95);
    token.beginPath();
    token.moveTo(x - 10, y - 7);
    token.lineTo(x, y + 1);
    token.lineTo(x + 10, y - 7);
    token.strokePath();

    token.fillStyle(0xffd66f, 0.22 + t * 0.15);
    token.fillCircle(x, y, 14);
  }

  private hideHandoffToken(): void {
    if (!this.handoffToken) return;

    this.tweens.add({
      targets: this.handoffToken,
      alpha: 0,
      duration: 120,
      onComplete: () => this.handoffToken?.setVisible(false),
    });
  }

  private resolveAgentEntity(reference: string): AgentEntity | null {
    const directMatch = this.agentSprites.get(reference);
    if (directMatch) return directMatch;

    const normalizedReference = reference.trim().toLowerCase();
    for (const sprite of this.agentSprites.values()) {
      const squadAgent = this.squadState?.agents.find((agent) => agent.id === sprite.id);
      if (!squadAgent) continue;
      if (squadAgent.name.trim().toLowerCase() === normalizedReference) {
        return sprite;
      }
    }

    return null;
  }
}
