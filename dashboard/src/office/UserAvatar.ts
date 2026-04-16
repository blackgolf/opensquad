import Phaser from 'phaser';
import { avatarKeys, type CharacterName } from './assetKeys';

const MOVE_SPEED = 210;
const AVATAR_SCALE = 0.8;

export class UserAvatar {
  private scene: Phaser.Scene;
  private avatar: Phaser.GameObjects.Image;
  private ring: Phaser.GameObjects.Graphics;
  private labelBg: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text;
  private avatarDisplayH = 0;
  private animationTimer?: Phaser.Time.TimerEvent;
  private frame = 0;
  private readonly characterName: CharacterName;

  constructor(scene: Phaser.Scene, x: number, y: number, characterName: CharacterName, name: string) {
    this.scene = scene;
    this.characterName = characterName;

    this.ring = scene.add.graphics().setDepth(y - 1);
    this.avatar = scene.add.image(x, y, avatarKeys(characterName).talk)
      .setOrigin(0.5, 0.5)
      .setScale(AVATAR_SCALE)
      .setDepth(y);
    this.avatarDisplayH = this.avatar.displayHeight;
    this.labelBg = scene.add.graphics().setDepth(970);
    this.labelText = scene.add.text(x, y - 46, name, {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#03131e',
      strokeThickness: 4,
      resolution: 2,
    }).setOrigin(0.5, 1).setDepth(971);

    this.startAnimation();
    this.syncDecorations();
  }

  get x(): number {
    return this.avatar.x;
  }

  get y(): number {
    return this.avatar.y;
  }

  get followTarget(): Phaser.GameObjects.Image {
    return this.avatar;
  }

  update(
    deltaMs: number,
    controls: {
      left: boolean;
      right: boolean;
      up: boolean;
      down: boolean;
    },
    bounds: Phaser.Geom.Rectangle,
  ): void {
    const axisX = Number(controls.right) - Number(controls.left);
    const axisY = Number(controls.down) - Number(controls.up);
    const direction = new Phaser.Math.Vector2(axisX, axisY);

    if (direction.lengthSq() > 0) {
      direction.normalize().scale((MOVE_SPEED * deltaMs) / 1000);
      this.avatar.x = Phaser.Math.Clamp(this.avatar.x + direction.x, bounds.left + 24, bounds.right - 24);
      this.avatar.y = Phaser.Math.Clamp(this.avatar.y + direction.y, bounds.top + 30, bounds.bottom - 24);
      this.avatar.setDepth(this.avatar.y);
    }

    this.syncDecorations();
  }

  destroy(): void {
    this.animationTimer?.destroy();
    this.ring.destroy();
    this.avatar.destroy();
    this.labelBg.destroy();
    this.labelText.destroy();
  }

  private syncDecorations(): void {
    this.ring.clear();
    this.ring.lineStyle(2, 0x00d4ff, 0.92);
    this.ring.fillStyle(0x00d4ff, 0.18);
    this.ring.fillEllipse(this.avatar.x, this.avatar.y + 18, 42, 16);
    this.ring.strokeEllipse(this.avatar.x, this.avatar.y + 18, 42, 16);

    this.labelText.setPosition(this.avatar.x, this.avatar.y - 46);

    this.labelBg.clear();
    const width = this.labelText.width + 18;
    this.labelBg.fillStyle(0x03131e, 0.88);
    this.labelBg.fillRoundedRect(this.avatar.x - width / 2, this.avatar.y - 64, width, 24, 8);
  }

  private startAnimation(): void {
    const keys = avatarKeys(this.characterName);
    this.animationTimer = this.scene.time.addEvent({
      delay: 380,
      loop: true,
      callback: () => {
        this.frame = (this.frame + 1) % 2;
        const nextKey = this.frame === 0 ? keys.talk : keys.wave1;
        this.avatar.setTexture(nextKey);
        this.avatar.setScale(this.avatarDisplayH / this.avatar.height);
      },
    });
  }
}
