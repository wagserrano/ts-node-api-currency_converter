import { Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse } from 'axios';

interface CurrencyConverted {
    transactionId: string;
    currFrom: string;
    amountFrom: number;
    currTo: string;
    amountTo: number;
}

interface DefCurrency{
    currSymbol: string;
    currValue: number;
}

const { 
    v1: uuidv1,
    v4: uuidv4,
  } = require('uuid');

// Getting your MY_APP_ID defined on openexchangerates.org
const myApiId: string = '<Declare your MY_APP_ID here>';
var myDefCurrency: DefCurrency[]=[];

// Get verb to verify if API is running
const getStatus = async (req: Request, res: Response, next: NextFunction) => {
    // get the post id from the req
    let myId: string = req.params.id;
    // Generate a v1 (time-based) id
    myId = uuidv1(); 
    console.log(myId);

    // post the requirement of convertion
    let result: AxiosResponse = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${myApiId}`);
    let currConv: CurrencyConverted = result.data;
    return res.status(200).json({
        currConv
    });
};

// Post verb (payload charged) to get a currency conversion 
const postCurrency = async (req: Request, res: Response, next: NextFunction) => {
    // get the data from req.body
    let body: any = req.body;
    let myId: string = body.id;
    let myCurrFrom: string = body.currFrom;
    let myCurrTo: string = body.currTo;
    let myAmountFrom: number = body.amountFrom;
    let myAmountTo: number = 0;

    // Convertion from/to the same currency not allowed
    if(myCurrFrom === myCurrTo){
        return res.status(406).json({
            message: `Converse not aceptable (${myCurrFrom})`
    })};

    // Generate a v4 (random) Trasnsaction Id
    myId = uuidv4(); 
    
    // Implements a Default value
    let resultAlt: AxiosResponse = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${myApiId}`);
    let currConv: CurrencyConverted = resultAlt.data; 
    let currencyConverted: CurrencyConverted = {transactionId: myId, currFrom: myCurrFrom, amountFrom: myAmountFrom, currTo: myCurrTo, amountTo: myAmountTo};
  
    // Get the requirement of convertion
    await axios.get(`https://openexchangerates.org/api/convert/${myAmountFrom}/${myCurrFrom}/${myCurrTo}?app_id=${myApiId}`).then((result) => {
        console.log('The currency convertion has sucessfull.');
        currencyConverted = result.data;
        return res.status(200).json({
            currencyConverted
        });
    }).catch((error) => {
        console.warn('Primary currency convertion not available!');
        currencyConverted.amountTo = convInternal(myCurrFrom, myCurrTo, myAmountFrom, currConv);
        return res.status(201).json({
            // error
            currencyConverted       
        });    
    });
};

function convInternal(lclCurrFrom: string, lclCurrTo:string, lclAmountFrom: number, lclCurrConv: any) : number {
    const currBase = 'USD';
    let lclRates : any = lclCurrConv.rates;
    let lclValConv : number = 0;
    let lclIdex: number = 0;
    let myPos:any;

    let myMap = new Map(Object.entries(lclRates));
    // console.log(myMap);

    myDefCurrency = [];
    let myCrPop: DefCurrency = {currSymbol: currBase, currValue: 1};

    myMap.forEach((value: any, key: string) => {
        myCrPop = {currSymbol: key, currValue: value} as unknown as DefCurrency;
        myDefCurrency.push(myCrPop);
    });

    if(lclCurrFrom === currBase){
        console.log('lclIdex I => ');
        lclValConv = lclAmountFrom
        lclIdex = 1;
    }else{
        myPos = myDefCurrency.findIndex(item => item.currSymbol === lclCurrFrom)
        lclIdex = myDefCurrency[myPos].currValue;
        lclValConv = lclAmountFrom / lclIdex;
    }

    myPos = myDefCurrency.findIndex(item => item.currSymbol === lclCurrTo)

    if(lclCurrFrom === currBase){
        lclValConv = (lclValConv * myDefCurrency[myPos].currValue) ;
    }else{
        if(myDefCurrency[myPos].currValue < 1){
            lclValConv = (lclValConv / myDefCurrency[myPos].currValue) ;
        }else{
            lclValConv = (lclValConv * myDefCurrency[myPos].currValue);
        }
    }
    return lclValConv;
}

export default { getStatus, postCurrency };