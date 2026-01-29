const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Use SQLite for local development as per requirements
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false,
});

// Define Models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  plan_type: {
    type: DataTypes.ENUM('free', 'pro', 'team'),
    defaultValue: 'free',
  },
  plan_valid_until: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  messages_usage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  usage_reset_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'assistant'),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

// Relationships
User.hasMany(Conversation, { foreignKey: 'userId', onDelete: 'CASCADE' });
Conversation.belongsTo(User, { foreignKey: 'userId' });
Conversation.hasMany(Message, { foreignKey: 'conversationId', onDelete: 'CASCADE' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected: SQLite');
    // Sync models
    await sequelize.sync({ force: false, alter: true }); // Using alter to add columns to existing tables
    console.log('Database synced');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB, Conversation, Message, User };
