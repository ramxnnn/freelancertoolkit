import React, { useReducer } from 'react';
import { getExchangeRate } from '../api/api';
import 'bootstrap/dist/css/bootstrap.min.css'; 
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
    <section id="currency" className="container mt-5">
      <h2 className="text-center text-primary mb-4">Currency Converter</h2>
      <div className="card shadow-lg p-4">
        <div className="row mb-3">
          <div className="col-md-4">
            <label htmlFor="fromCurrency" className="form-label">From Currency</label>
            <select
              id="fromCurrency"
              className="form-select"
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
          <div className="col-md-4 d-flex align-items-center justify-content-center">
            <span className="text-muted">to</span>
          </div>
          <div className="col-md-4">
            <label htmlFor="toCurrency" className="form-label">To Currency</label>
            <select
              id="toCurrency"
              className="form-select"
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

        <div className="mb-3">
          <label htmlFor="amount" className="form-label">Amount</label>
          <input
            type="number"
            id="amount"
            className="form-control"
            value={state.amount}
            onChange={(e) => dispatch({ type: 'SET_AMOUNT', payload: e.target.value })}
          />
        </div>

        <button className="btn btn-primary w-100" onClick={handleConvert}>Convert</button>

        {state.convertedAmount !== null && (
          <div className="mt-3">
            <h5 className="text-success">Converted Amount:</h5>
            <p>
              {state.convertedAmount} {state.toCurrency}
            </p>
          </div>
        )}

        {state.error && (
          <div className="alert alert-danger mt-3">
            {state.error}
          </div>
        )}
      </div>
    </section>
  );
};

export default CurrencyConverter;
