const Customer = require('../Models/CustomerModel');
const autoSeq=require('../controller/AutoSeq.controller');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
var { secret } = require("../database/config");
const { auth } = require("../passport/passport");

auth();
 const saltRounds = 10;
module.exports = {
    createCustomer: async (createCust) => {

      //  console.log('createCust',createCust);
       const custIdValue=await autoSeq.getSequenceValue('customer');
    //    console.log('inside create customer');
return new Promise((resolve,reject)=>{
         

    console.log('custid value::',custIdValue)
    let customer=new Customer({
    _id:custIdValue,
    custName:createCust.custName,
    custEmail:createCust.custEmail,
    custPasswd:createCust.custPassword,
    createdBy:createCust.custName,
    countryCodeId:createCust.countryCode,
    custPhoneNumber:createCust.custPhoneNumber,

    createdDate:new Date()
    })
  Customer.findOne({ custEmail: createCust.custEmail }, (error, oldCustomer) => {
        if (error) {
    console.log(error);
            // res.writeHead(500, {
            //     'Content-Type': 'text/plain'
            // })
            // res.end();
        }
        if (oldCustomer) {
           const errorRes={
               "code":"E01",
               "desc":"Email already exists"
           }
          return resolve(errorRes);
        }
        else {
        //    console.log('non exist cust',customer)
            bcrypt.hash(customer.custPasswd, saltRounds, (err, hash)=> {
             //   console.log('hash:',hash)
            customer.custPasswd = hash; 
            customer.save((error, data) => {
                if (error) {    
                   console.log(error);
                }
                else {
                      const payload = { _id: data._id, custEmail: data.custEmail};
                     const token = jwt.sign(payload, secret, {
                expiresIn: 1008000
            });
            data.token="JWT "+token;
            data.code="S01";
            console.log("data:",data);
                   return resolve(data);
                }
            });
        });
        }
    });
     });
},
 

checkLogin:async(loginDetails)=>{

  console.log('loginDetails',loginDetails)
    return new Promise((resolve,reject)=>{
    Customer.findOne({ custEmail: loginDetails.loginUserId },(err,existingCust)=>{
  if (err) {  
   const errorRes={
               "code":"E01",
               "desc":"Something went wrong.Please try again"
           }
          return resolve(errorRes);
        }
      else{
          bcrypt.compare(loginDetails.loginPassword, existingCust.custPasswd)
          .then(response=>{
            
                const payload = { _id: existingCust._id, custEmail: existingCust.custEmail};
         console.log('payload',payload)
            const token = jwt.sign(payload, secret, {
                expiresIn: 1008000
            });
           // console.log("token:"+token)
            existingCust.token="JWT "+token;
            existingCust.code="S01";
            console.log('existing cust',existingCust)
             return resolve(existingCust);
        }).catch(error=>{
                 const errorRes={
               "code":"E01",
               "desc":"Something went wrong.Please try again"
           }
          return resolve(errorRes);
            })
      }
    })
    })
},

allCustomers:async()=>{
       return new Promise((resolve,reject)=>{
Customer.find({},(err,customerDtls)=>{
    if(err){
  const errorRes={
               "code":"E01",
               "desc":"Unable to fetch all customer details"
           }
          return resolve(errorRes);
        }
        else{
             return resolve(customerDtls);
        }
})
       })
}


}