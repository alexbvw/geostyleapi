import ip from 'ip';       
import { app } from './server';

const PORT = 3001;

app.listen(PORT, () =>
  console.log(`🚀 server running on: ${ip.address()}:${PORT}`),
)
