import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI not found');
    return;
  }
  
  console.log('Testing MongoDB Atlas connection...');
  console.log('URI format:', uri.substring(0, 20) + '...' + uri.substring(uri.length - 20));
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
  
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('✅ Connected successfully');
    
    console.log('Testing ping...');
    await client.db().admin().ping();
    console.log('✅ Ping successful');
    
    console.log('Listing databases...');
    const dbs = await client.db().admin().listDatabases();
    console.log('Available databases:', dbs.databases.map(db => db.name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

testConnection();