const express = require("express")
var cors= require('cors');
const {getConnection} = require('./db')


const app = express()


app.use(express.json({
    limit:'10kb'
}));
app.use(express.urlencoded({extended:true, limit:'10kb'}))
app.use(cors());

function formatDate(date) {
    const isoString = date.toISOString();
    return isoString.replace('T', ' ').substring(0, 19);
  }

const insertEntry = async (email, phoneNumber, linkedId, is_primary) => {
    const connection =  await getConnection()
    const [rows] = await connection.execute(
        `INSERT INTO contacts (email, phone_no, is_primary, linked_id) VALUES (
            '${email}',
            '${phoneNumber}',
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

const findById = async (employee_id) => {
    const connection =  await getConnection()
    const [rows] = await connection.execute(`SELECT * FROM contacts WHERE employee_id = '${employee_id}'`)
    console.log(rows)
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
    const [rows] = await connection.execute(
        `UPDATE contacts SET\
            is_primary = ${is_primary},\
            linked_id = ${linked_id},\
            updated_at = '${formatDate(new Date())}'\
        WHERE employee_id = ${employee_id}`)
    await connection.end()
    return rows
}
const findAllContacts = async (primaryContactId) => {
    const connection =  await getConnection()
    const [rows] = await connection.execute(`SELECT * FROM contacts WHERE linked_id = ${primaryContactId} OR employee_id = ${primaryContactId};`)
    await connection.end()
    return rows
}
const makeResponse = (objects, primaryContactId) => {
    let contact = {}
    contact.emails = []
    contact.phoneNumbers = []
    contact.secondaryContactIds = []
    contact.primaryContactId = primaryContactId
    for (let i = 0; i < objects.length; i++) {
        if(!objects[i].is_primary){
            contact.secondaryContactIds.push(objects[i].employee_id)
        }
        contact.emails.push(objects[i].email)
        contact.phoneNumbers.push(objects[i].phone_no)
    }
    contact.emails = [...new Set(contact.emails)];
    contact.phoneNumbers = [...new Set(contact.phoneNumbers)];
    return contact
}

app.post("/identify" , async (req,res) => {
    const email = req.body.email
    const phoneNumber = req.body.phoneNumber
    const resultPh = await findPhoneNo(phoneNumber)
    const resultem = await findEmail(email)
    const mergedArray = [...resultPh, ...resultem]
    const uniqueObjects = getUniqueObjects(mergedArray, 'employee_id');
    const NoOfPrimaryEntries = noOfIsPrimary(uniqueObjects)
    let finalPrimaryID;
    let contact = {}
    let response
    if(uniqueObjects.length === 0){
        response = await insertEntry(email, phoneNumber, null, 1)
        finalPrimaryID = response.insertId
    }
    else if (resultPh.length > 0 && resultem.length > 0){
        const exactsArr = uniqueObjects.find(user => user.email == email && user.phone_no == phoneNumber)
        if(exactsArr){
            finalPrimaryID = exactsArr.employee_id
            contact = makeResponse(uniqueObjects, exactsArr.employee_id)
            return res.status(200).json({
                contact
            })
            }
        if (NoOfPrimaryEntries.length === 0){
            response = await insertEntry(email, phoneNumber, uniqueObjects[0].linkedId, 0)
            finalPrimaryID = uniqueObjects[0].linked_id
        }
        else if(NoOfPrimaryEntries.length === 1){
            response = await insertEntry(email, phoneNumber, NoOfPrimaryEntries[0].employee_id, 0)
            finalPrimaryID = NoOfPrimaryEntries[0].employee_id
        }
        else{
            const newPrimaryEntry = await insertEntry(email,phoneNumber, null, 1)
            await Promise.all(NoOfPrimaryEntries.map(async (item) => {
                await updateEntry(item.employee_id, 0, newPrimaryEntry.insertId)
            }));
            for (let i = 0; i < NoOfPrimaryEntries.length; i++) {
                await updateEntry(NoOfPrimaryEntries[i].employee_id, 0, newPrimaryEntry.insertId)
            }
            finalPrimaryID = newPrimaryEntry.insertId
        }
    }
    else if(resultPh.length > 0){
        const primaryUser = resultPh.find(user => user.is_primary === 1);
        if (primaryUser){
            response = await insertEntry(email, phoneNumber, primaryUser.employee_id, 0)
            finalPrimaryID = primaryUser.employee_id
        }else{
            response = await insertEntry(email, phoneNumber, resultPh[0].linked_id, 0)
            finalPrimaryID = resultPh[0].linked_id
        }
    }
    else if(resultem.length > 0){
        const primaryUser = resultem.find(user => user.is_primary === 1);
        if (primaryUser){
            response = await insertEntry(email, phoneNumber, primaryUser.employee_id, 0)
            finalPrimaryID = primaryUser.employee_id
        }else{
            response = await insertEntry(email, phoneNumber, resultem[0].linked_id, 0)
            finalPrimaryID = resultem[0].linked_id
        }
    }
    contacts = await findAllContacts(finalPrimaryID)
    contact = makeResponse(contacts, finalPrimaryID)

    res.status(200).json({
        contact
    })
})


module.exports =  app