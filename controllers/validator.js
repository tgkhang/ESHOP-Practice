'use strict';

const{body,validationResult}= require('express-validator');

function getErrorMessage(req){
    let errors= validationResult(req);
    if(!errors.isEmpty()){
        let errorArray= errors.array();
        return errorArray.reduce((message,error) => {
            return message +error.message +"<br/>";
        }
        , '');   
    }    
    return null;
}

module.exports= {body, getErrorMessage}