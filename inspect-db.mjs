import dotenv from './.cache/backend-review/node_modules/dotenv/lib/main.js';
import mongoose from './.cache/backend-review/node_modules/mongoose/index.js';
dotenv.config({path:'../dandenong-hyundai-demo-backend/.env',quiet:true});
await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:5000});
const h=await mongoose.connection.db.admin().command({hello:1});
console.log(JSON.stringify({database:mongoose.connection.name,replicaSet:!!h.setName}));
console.log(JSON.stringify(await mongoose.connection.db.collection('entities').findOne({},{projection:{name:1,isIllustrative:1}})));
await mongoose.disconnect();
