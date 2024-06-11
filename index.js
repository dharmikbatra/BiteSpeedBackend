
const app = require('./app')
const connection = require('./db')

const port  = process.env.PORT || 3000


const server = app.listen(port, () => {
    console.log(`listening on port ${port}`)
})



