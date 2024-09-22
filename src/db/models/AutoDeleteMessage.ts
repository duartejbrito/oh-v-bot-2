import { DataTypes, InferAttributes, Model, Sequelize } from "sequelize";

export class AutoDeleteMessage extends Model<
  InferAttributes<AutoDeleteMessage>
> {
  declare guildId: string;
  declare messageId: string;
  declare channelId: string;
  declare timeout: number;

  static initModel(sequelize: Sequelize): typeof AutoDeleteMessage {
    AutoDeleteMessage.init(
      {
        guildId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        messageId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        channelId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        timeout: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
      }
    );

    return AutoDeleteMessage;
  }
}
