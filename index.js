import { app, httpServer, io } from './app.js'
import config from './utils/config.js'


httpServer.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})