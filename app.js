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
    return rows
}


const findPhoneNo = async (phoneNumber) => {
    const connection =  await getConnection()
    const [rows] = await connection.execute(`SELECT * FROM contacts WHERE phone_no = '${phoneNumber}'`)
    await connection.end()
    return rows
}


const findEmail = async (email) => {
    const connection =  await getConnection()
    const [rows] = await connection.execute(`SELECT * FROM contacts WHERE email = '${email}'`)
    await connection.end()
    return rows
}

function getUniqueObjects(array, key) {
    const seen = new Set();
    return array.filter(item => {
        const keyValue = item[key];
        if (seen.has(keyValue)) {
            return false;
        } else {
            seen.add(keyValue);
            return true;
        }
    });
}
function noOfIsPrimary(array) {
    const arr = array.filter(item => {
        if (item.is_primary) {
            return true;
        } else {
            return false;
        }
    });
    return arr;
}

const updateEntry = async (employee_id, is_primary, linked_id) => {
    const connection =  await getConnection()
    const [rows] = await connection.execute(`UPDATE users SET is_primary = '${is_primary}', linked_id = '${linked_id}' WHERE employee_id = ${employee_id};`)
    await connection.end()
    return rows
}

const makeResponse = (email, phoneNumber) => {

}

app.post("/identify" , async (req,res) => {
    const email = req.body.email
    const phoneNumber = req.body.phoneNumber
    const resultPh = await findPhoneNo(phoneNumber)
    const resultem = await findEmail(email)
    const mergedArray = [...resultPh, ...resultem]
    const uniqueObjects = getUniqueObjects(mergedArray, 'employee_id');
    const NoOfPrimaryEntries = noOfIsPrimary(uniqueObjects)
    let response
    
    if(uniqueObjects.length === 0){
        response = await insertEntry(email, phoneNumber, null, 1)
    }
    else if (resultPh.length > 0 && resultem.length > 0){
        // console.log(uniqueObjects)
        const tempArr = uniqueObjects.find(user => user.email == email && user.phone_no == phoneNumber)
        // console.log("tempArr")
        // console.log(tempArr)
        if(tempArr){
            return res.status(200).json({
                status:"Success",
                message:"User already there",
                data:uniqueObjects[0]
            })}
        console.log("noOFPri")
        console.log(NoOfPrimaryEntries)
        if (NoOfPrimaryEntries.length === 0){
            console.log("hi")
            response = await insertEntry(email, phoneNumber, uniqueObjects[0].linkedId, 0)
        }
        else if(NoOfPrimaryEntries.length === 1){
            response = await insertEntry(email, phoneNumber, NoOfPrimaryEntries[0].employee_id, 0)
        }
        else{
            const newPrimaryEntry = await insertEntry(email,phoneNumber, null, 1)
            NoOfPrimaryEntries.forEach(async element => {
                await updateEntry(element.employee_id, 0, newPrimaryEntry.employee_id)
            });
        }
    }
    else if(resultPh.length > 0){
        const primaryUser = resultPh.find(user => user.is_primary === 1);
        if (primaryUser){
            response = await insertEntry(email, phoneNumber, primaryUser.employee_id, 0)
        }else{
            response = await insertEntry(email, phoneNumber, resultPh[0].linked_id, 0)
        }
    }
    else if(resultem.length > 0){
        const primaryUser = resultem.find(user => user.is_primary === 1);
        if (primaryUser){
            response = await insertEntry(email, phoneNumber, primaryUser.employee_id, 0)
        }else{
            response = await insertEntry(email, phoneNumber, resultem[0].linked_id, 0)
        }
    }
    res.send(response)
})


module.exports =  app