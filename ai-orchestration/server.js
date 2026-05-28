import 'dotenv/config';
import app from './src/app.js';

const PORT=Process.env.PORT||3000;

app.listen(PORT,()=>{
    console.log(`ai server is running on port ${PORT}`);
})