import { MongoClient } from 'mongodb';
import {
  ObjectId
} from 'mongodb';

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
  {
    '$match': {
      'product': new ObjectId('660e9d13337c65bcd7e419a1')
    }
  }, {
    '$group': {
      '_id': null, 
      'avarageRating': {
        '$avg': '$rating'
      }, 
      'numOfReviews': {
        '$sum': 1
      }
    }
  }
];

const client = await MongoClient.connect(
  'mongodb+srv://yogesh:1234@cluster0.fwion7d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
);
const coll = client.db('e-commerce-api').collection('reviews');
const cursor = coll.aggregate(agg);
const result = await cursor.toArray();
await client.close();