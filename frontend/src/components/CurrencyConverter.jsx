import React, { useReducer } from 'react';
import { getExchangeRate } from '../api/api';
import Card from './Card'; // Reusable Card component
import Button from './Button'; // Reusable Button component
import Input from './Input'; // Reusable Input component

// Reducer function for currency converter
const initialState = {
  fromCurrency: 'USD',
  toCurrency: 'EUR',
  amount: 1,
  convertedAmount: null,
  error: '',
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
      return { ...state, convertedAmount: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const CurrencyConverter = () => {
  const [state, dispatch] = useReducer(currencyReducer, initialState);

  const handleConvert = async () => {
    dispatch({ type: 'SET_ERROR', payload: '' });
    try {
      const result = await getExchangeRate(state.fromCurrency, state.toCurrency, state.amount);
      if (result && result.convertedAmount) {
        dispatch({ type: 'SET_CONVERTED_AMOUNT', payload: result.convertedAmount });
      } else {
        throw new Error('Invalid conversion result');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to convert currency. Please try again later.' });
    }
  };

  return (
    <section id="currency" className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Currency Converter</h2>
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700 mb-1">From Currency</label>
            <select
              id="fromCurrency"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={state.fromCurrency}
              onChange={(e) => dispatch({ type: 'SET_FROM_CURRENCY', payload: e.target.value })}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="INR">INR</option>
              <option value="GBP">GBP</option>
              <option value="AUD">AUD</option>
              <option value="CAD">CAD</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-gray-500">to</span>
          </div>
          <div>
            <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-700 mb-1">To Currency</label>
            <select
              id="toCurrency"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={state.toCurrency}
              onChange={(e) => dispatch({ type: 'SET_TO_CURRENCY', payload: e.target.value })}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="INR">INR</option>
              <option value="GBP">GBP</option>
              <option value="AUD">AUD</option>
              <option value="CAD">CAD</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <Input
            type="number"
            id="amount"
            value={state.amount}
            onChange={(e) => dispatch({ type: 'SET_AMOUNT', payload: e.target.value })}
          />
        </div>

        <Button onClick={handleConvert} className="w-full">Convert</Button>

        {state.convertedAmount !== null && (
          <div className="mt-4">
            <h5 className="text-lg font-semibold text-green-600">Converted Amount:</h5>
            <p className="text-gray-700">
              {state.convertedAmount} {state.toCurrency}
            </p>
          </div>
        )}

        {state.error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {state.error}
          </div>
        )}
      </Card>
    </section>
  );
};

export default CurrencyConverter;