
const dotenv = require("dotenv")
const app = require('./app')
const connection = require('./db')

dotenv.config()
const port  = process.env.PORT || 3000


const server = app.listen(port, () => {
    console.log(`listening on port ${port}`)
})



