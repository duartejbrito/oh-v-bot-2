import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class AutoDeleteMessage extends Model<
  InferAttributes<AutoDeleteMessage>,
  InferCreationAttributes<AutoDeleteMessage>
> {
  declare guildId: string;
  declare messageId: string;
  declare channelId: string;
  declare timeout: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

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
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
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
