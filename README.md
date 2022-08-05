# ts-node-api-currency_converter
TypeScript-Node API for Currencies Convertion

Steps to run the API:
---------------------
Open a new terminal in this editor or a terminalcmd or a git bash, then folloow these steps: 
1) Restore the packages in the path ..\src\ts-api-converter>, using yarn or yarn install

2) Build the API, using yarn build command.

3) Put the API to run, using the command yarn start.

4) To verify if the API is alive, try a get requisition http://localhost:4214/converter

5) To do a conversion, use a post requisition, in the url http://localhost:4214/converter, usin a payload like this:
    {
	    "id": 1,
	    "currFrom": "EUR",
    	"amountFrom": 100,
    	"currTo": "USD",
    	"amountTo": 0
    }
