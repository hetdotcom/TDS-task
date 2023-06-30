/* eslint-disable semi */
/* eslint-disable comma-dangle */
const messages = {
  healthCheckPass: { sMessage: 'Pong' },
  healthCheckFail: { sMessage: 'Health check failed!!' },

  userAdded: { sMessage: 'user added successfully!!' },
  userNotAdded: { sMessage: 'user not added, Internal Server Error' },
  duplicateUser: { sMessage: 'This user is already present in database!!' },
  userNotPresent: {
    sMessage: 'sender or receiver is not present in database!!',
  },

  transactionFailed: { sMessage: 'Transaction failed!!' },
  transactionDone: { sMessage: 'Transaction done!!' },

  insufficientBalance: { sMessage: 'insufficient balance!!' },

  notFound: { sMessage: 'Data not found, Enter valid URL!!' },

  moneyAdded: { sMessage: 'money added successfully!!' },
  moneyWithdrawn: { sMessage: 'money withdrawn successfully!!' },
  moneyNotAdded: { sMessage: 'money not added, Internal Server Error' },

  invalidTransactionType: {
    sMessage: 'Enter Valid Transaction type',
  },
}

module.exports = messages
