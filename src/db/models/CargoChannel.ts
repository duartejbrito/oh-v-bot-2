import { DataTypes, InferAttributes, Model, Sequelize } from "sequelize";

export class CargoChannel extends Model<InferAttributes<CargoChannel>> {
  declare guildId: string;
  declare channelId: string;
  declare roleId?: string;
  declare autoDelete: boolean;
  declare mute: string[];
  declare addedBy: string;

  static initModel(sequelize: Sequelize): typeof CargoChannel {
    CargoChannel.init(
      {
        guildId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        channelId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        roleId: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        autoDelete: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        mute: {
          type: DataTypes.JSONB,
          defaultValue: [],
          allowNull: false,
        },
        addedBy: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
      }
    );

    return CargoChannel;
  }
}
