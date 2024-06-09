const express = require("express")
var cors= require('cors');
const {getConnection} = require('./db')


const app = express()


app.use(express.json({
    limit:'10kb'
}));
app.use(express.urlencoded({extended:true, limit:'10kb'}))
app.use(cors());

const insertEntry = async (email, phoneNumber, linkedId, is_primary) => {
    const connection =  await getConnection()
    const [rows] = await connection.execute(
        `INSERT INTO contacts (email, phone_no, created_at, updated_at, is_primary, linked_id) VALUES (
            '${email}',
            '${phoneNumber}',
            ${Date.now()},
            ${Date.now()},
            ${is_primary},
            ${linkedId})`
    )
    await connection.query(
        `INSERT INTO contacts (email, phone_no, created_at, updated_at, is_primary) VALUES ('${email}', '${phoneNumber}', ${Date.now()}, ${Date.now()}, 1)`, function (error, results, fields) {
            if (error) return [-1, error];
            res.status(200).json({
                status:"success"
            })
          }
    );
}


const findPhoneNo = async (phoneNumber) => {
    const connection =  await getConnection()
    console.log(phoneNumber)
    const [rows] = await connection.execute(`SELECT * FROM contacts WHERE phone_no = '${phoneNumber}'`)
    await connection.end()
    console.log(rows)
    return rows
}


const findEmail = async (email) => {
    const connection =  await getConnection()
    const [rows] = await connection.execute(`SELECT * FROM contacts WHERE email = '${email}'`)
    await connection.end()
    console.log(rows)
    return rows
}







app.post("/identify" , async (req,res) => {
    res.send("hello")
})


module.exports =  app