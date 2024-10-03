import React, { useState } from 'react';
import './Home.css';
import { STOCK_CALCULATE } from '../../helper/urlhelpers';

const Home = () => {
    const [strikeName, setStrikeName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [buyPrice, setBuyPrice] = useState('');
    const [sellPrice, setSellPrice] = useState('');
    const [charges, setCharges] = useState('');
    const [brokerage, setBrokerage] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Assuming you have a function to get the logged-in user's ID
        const userId = localStorage.getItem("userID");

        // Convert charges and brokerage to numbers, defaulting to 0 if empty
        const chargesValue = charges === '' ? 0 : parseFloat(charges);
        const brokerageValue = brokerage === '' ? 0 : parseFloat(brokerage);

        const response = await fetch(`${process.env.REACT_APP_API_URL}${STOCK_CALCULATE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId, // Include userId in the request body
                strikeName,
                quantity,
                buyPrice,
                sellPrice,
                charges: chargesValue,
                brokerage: brokerageValue,
            }),
        });

        const data = await response.json();
        setResult(data);

        // Reset form fields
        setStrikeName('');
        setQuantity('');
        setBuyPrice('');
        setSellPrice('');
        setCharges('');
        setBrokerage('');
    };

    return (
        <div className="stock-form-container">
            <form onSubmit={handleSubmit} className="stock-form">
                <div className="input-group">
                    <label htmlFor="strikeName">Strike/Share Name:</label>
                    <input
                        type="text"
                        id="strikeName"
                        value={strikeName}
                        onChange={(e) => setStrikeName(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="quantity">Quantity:</label>
                    <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="buyPrice">Buy Price:</label>
                    <input
                        type="number"
                        id="buyPrice"
                        value={buyPrice}
                        onChange={(e) => setBuyPrice(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="sellPrice">Sell Price:</label>
                    <input
                        type="number"
                        id="sellPrice"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="charges">Charges:</label>
                    <input
                        type="number"
                        id="charges"
                        value={charges}
                        onChange={(e) => setCharges(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="brokerage">Brokerage:</label>
                    <input
                        type="number"
                        id="brokerage"
                        value={brokerage}
                        onChange={(e) => setBrokerage(e.target.value)}
                    />
                </div>
                <button type="submit" className="submit-button">Calculate</button>
            </form>
            {result && (
                <div className="result">
                    {result.profit !== null && (
                        <h3>Profit: ₹{result.profit.toFixed(2)}</h3>
                    )}
                    {result.loss !== null && (
                        <h3>Loss: ₹{result.loss.toFixed(2)}</h3>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
