import React, { useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExchangeRate } from '../api/api';
import Card from './Card';
import Button from './Button';
import Input from './Input';

const initialState = {
  fromCurrency: 'USD',
  toCurrency: 'EUR',
  amount: 1,
  convertedAmount: null,
  error: '',
  isLoading: false,
};

function currencyReducer(state, action) {
  switch (action.type) {
    case 'SET_FROM_CURRENCY':
      return { ...state, fromCurrency: action.payload };
    case 'SET_TO_CURRENCY':
      return { ...state, toCurrency: action.payload };
    case 'SET_AMOUNT':
      return { ...state, amount: action.payload };
    case 'SET_CONVERTED_AMOUNT':
      return { ...state, convertedAmount: action.payload, isLoading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SWAP_CURRENCIES':
      return { 
        ...state, 
        fromCurrency: state.toCurrency, 
        toCurrency: state.fromCurrency,
        convertedAmount: null
      };
    default:
      return state;
  }
}

// A comprehensive list of currency codes (ISO 4217)
const currencies = [
  'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN',
  'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL',
  'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY',
  'COP', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD',
  'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'FOK', 'GBP', 'GEL', 'GGP',
  'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG',
  'HUF', 'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD',
  'JPY', 'KES', 'KGS', 'KHR', 'KID', 'KMF', 'KRW', 'KWD', 'KYD', 'KZT',
  'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD',
  'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN',
  'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK',
  'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR',
  'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SLL', 'SOS', 'SRD',
  'SSP', 'STN', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY',
  'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VES',
  'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'YER', 'ZAR',
  'ZMW', 'ZWL'
];

const CurrencyConverter = () => {
  const [state, dispatch] = useReducer(currencyReducer, initialState);

  const handleConvert = async () => {
    // Ensure amount is a valid number
    if (!state.amount || state.amount <= 0) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter a valid amount' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });
    
    try {
      const result = await getExchangeRate(state.fromCurrency, state.toCurrency, state.amount);
      if (result && result.convertedAmount) {
        // Convert the result to a number before storing it in state
        const numericConvertedAmount = Number(result.convertedAmount);
        if (isNaN(numericConvertedAmount)) {
          throw new Error('Conversion result is not a valid number');
        }
        dispatch({ type: 'SET_CONVERTED_AMOUNT', payload: numericConvertedAmount });
      } else {
        throw new Error('Invalid conversion result');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to convert currency. Please try again later.' });
    }
  };

  const handleSwapCurrencies = () => {
    dispatch({ type: 'SWAP_CURRENCIES' });
  };

  return (
    <section id="currency" className="container mx-auto p-4 max-w-2xl">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-center text-indigo-600 mb-8"
      >
        Currency Converter
      </motion.h2>
      
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
          <div>
            <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <div className="relative">
              <select
                id="fromCurrency"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                value={state.fromCurrency}
                onChange={(e) => dispatch({ type: 'SET_FROM_CURRENCY', payload: e.target.value })}
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <button 
              onClick={handleSwapCurrencies}
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
              aria-label="Swap currencies"
            >
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>
          
          <div>
            <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <div className="relative">
              <select
                id="toCurrency"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                value={state.toCurrency}
                onChange={(e) => dispatch({ type: 'SET_TO_CURRENCY', payload: e.target.value })}
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <Input
            type="number"
            id="amount"
            min="0"
            step="0.01"
            value={state.amount}
            onChange={(e) => dispatch({ type: 'SET_AMOUNT', payload: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter amount"
          />
        </div>

        <Button 
          onClick={handleConvert} 
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition duration-200 transform hover:scale-[1.02]"
          disabled={state.isLoading}
        >
          {state.isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Converting...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Convert
            </span>
          )}
        </Button>

        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-sm overflow-hidden"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {state.error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {state.convertedAmount !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 p-4 bg-white border border-green-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Converted Amount</h5>
                  <p className="mt-1 text-2xl font-bold text-green-600">
                    {state.convertedAmount.toFixed(2)} <span className="text-lg font-normal">{state.toCurrency}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Exchange Rate</p>
                  <p className="text-lg font-semibold text-gray-700">
                    1 {state.fromCurrency} = {(state.convertedAmount / state.amount).toFixed(6)} {state.toCurrency}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  {state.amount} {state.fromCurrency} = {state.convertedAmount.toFixed(2)} {state.toCurrency}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Exchange rates are updated regularly but may vary slightly from market rates.</p>
      </div>
    </section>
  );
};

export default CurrencyConverter;
