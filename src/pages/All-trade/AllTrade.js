import React, { useState, useEffect } from 'react';
import './AllTrade.css'; // Import the CSS file

const AllTrades = () => {
    const [trades, setTrades] = useState([]);
    const [editingTrade, setEditingTrade] = useState(null);
    const [error, setError] = useState(null);
    const [fromDate, setFromDate] = useState(''); // State for the "from" date
    const [toDate, setToDate] = useState(''); // State for the "to" date
    const [dailyCharges, setDailyCharges] = useState({});
    const [chargesUpdated, setChargesUpdated] = useState({});


    useEffect(() => {
        fetchAllTrades();
    }, []);

    const fetchAllTrades = async () => {
        try {
            const token = localStorage.getItem('userID');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`http://localhost:4000/userTrades/${token}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch trades');
            }

            const data = await response.json();
            setTrades(data);

            // Initialize chargesUpdated state based on fetched trades
            const updatedCharges = {};
            data.forEach(trade => {
                const date = new Date(trade.createdAt).toISOString().split('T')[0];
                if (trade.dailyChargesUpdated) {
                    updatedCharges[date] = true;
                }
            });
            setChargesUpdated(updatedCharges);
        } catch (error) {
            console.error('Error fetching trades:', error);
            setError(error.message);
        }
    };

    const handleDailyChargesChange = (date, value) => {
        setDailyCharges({
            ...dailyCharges,
            [date]: value
        });
    };

    const handleUpdateDailyCharges = async (date) => {
        try {
            const token = localStorage.getItem('userID');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`http://localhost:4000/updateDailyCharges`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: token,
                    date,
                    charges: dailyCharges[date]
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update daily charges');
            }

            const updatedTrades = await response.json();
            setTrades(updatedTrades);
            setDailyCharges({ ...dailyCharges, [date]: '' });
            setChargesUpdated({ ...chargesUpdated, [date]: true });
        } catch (error) {
            console.error('Error updating daily charges:', error);
            setError(error.message);
        }
    };


    const handleEditClick = (trade) => {
        setEditingTrade(trade);
    };

    const handleCancelEdit = () => {
        setEditingTrade(null);
    };

    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem('userID');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const {
                quantity,
                buyPrice,
                sellPrice,
                charges,
                brokerage
            } = editingTrade;

            // Convert values to numbers
            const quantityNum = Number(quantity);
            const buyPriceNum = Number(buyPrice);
            const sellPriceNum = Number(sellPrice);
            const chargesNum = Number(charges);
            const brokerageNum = Number(brokerage);

            const calculatedProfitOrLoss =
                (sellPriceNum - buyPriceNum) * quantityNum - (chargesNum + brokerageNum);

            const updatedTrade = {
                ...editingTrade,
                profit: calculatedProfitOrLoss > 0 ? calculatedProfitOrLoss : 0,
                loss: calculatedProfitOrLoss < 0 ? Math.abs(calculatedProfitOrLoss) : 0,
            };

            const response = await fetch(`http://localhost:4000/userTrades/${editingTrade._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTrade),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update trade');
            }

            const updatedData = await response.json();

            setTrades(trades.map(trade => trade._id === updatedData._id ? updatedData : trade));
            setEditingTrade(null);
        } catch (error) {
            console.error('Error updating trade:', error);
            setError(error.message);
        }
    };

    const handleChange = (e) => {
        setEditingTrade({
            ...editingTrade,
            [e.target.name]: e.target.value,
        });
    };

    const handleFromDateChange = (e) => {
        setFromDate(e.target.value);
    };

    const handleToDateChange = (e) => {
        setToDate(e.target.value);
    };

    // Get today's date in yyyy-mm-dd format
    const getTodayDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // Filter trades based on the selected date range
    const filteredTrades = trades.filter(trade => {
        if (!fromDate && !toDate) return true;
        const tradeDate = new Date(trade.createdAt).toISOString().split('T')[0];
        if (fromDate && tradeDate < fromDate) return false;
        if (toDate && tradeDate > toDate) return false;
        return true;
    });

    // Group trades by date
    const groupTradesByDate = (trades) => {
        const grouped = trades.reduce((groups, trade) => {
            const tradeDate = new Date(trade.createdAt).toISOString().split('T')[0];
            if (!groups[tradeDate]) {
                groups[tradeDate] = [];
            }
            groups[tradeDate].push(trade);
            return groups;
        }, {});

        // Sort the dates in descending order
        const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

        // Return the grouped trades with sorted dates
        return sortedDates.reduce((sortedGroup, date) => {
            sortedGroup[date] = grouped[date];
            return sortedGroup;
        }, {});
    };


    const groupedTrades = groupTradesByDate(filteredTrades);

    const formatCurrency = (value) => {
        return parseFloat(value).toFixed(2);
    };

    const calculateDailyTotals = (trades) => {
        return trades.reduce((totals, trade) => {
            totals.profit += trade.profit || 0;
            totals.loss += trade.loss || 0;
            totals.net = totals.profit - totals.loss;
            return totals;
        }, { profit: 0, loss: 0, net: 0 });
    };;

    return (
        <div>
            <h1>All Trades</h1>
            {error && <p className="error">{error}</p>}
            <div className="filter-section">
                <label htmlFor="fromDateFilter">From:</label>
                <input
                    type="date"
                    id="fromDateFilter"
                    value={fromDate}
                    onChange={handleFromDateChange}
                    max={getTodayDate()} // Disable future dates
                />
                <label htmlFor="toDateFilter">To:</label>
                <input
                    type="date"
                    id="toDateFilter"
                    value={toDate}
                    onChange={handleToDateChange}
                    max={getTodayDate()} // Disable future dates
                />
            </div>
            {Object.keys(groupedTrades).length > 0 ? (
                <>
                    {Object.keys(groupedTrades).map(date => {
                        const dailyTotals = calculateDailyTotals(groupedTrades[date]);
                        return (
                            <div key={date}>
                                <div className="upper">
                                    <h2>{new Date(date).toDateString()}</h2>
                                    <div className="daily-totals">
                                        <p>
                                            Daily Profit: <span className="profit">₹{formatCurrency(dailyTotals.profit)}</span> |
                                            Daily Loss: <span className="loss">₹{formatCurrency(dailyTotals.loss)}</span> |
                                            Net Profit/Loss: <span className={dailyTotals.net >= 0 ? "profit" : "loss"}>
                                                ₹{formatCurrency(dailyTotals.net)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <table className="trades-table">
                                    <thead>
                                        <tr>
                                            <th>Strike Name</th>
                                            <th>Quantity</th>
                                            <th>Buy Price</th>
                                            <th>Sell Price</th>
                                            <th>Charges</th>
                                            <th>Brokerage</th>
                                            <th>Profit</th>
                                            <th>Loss</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedTrades[date].map(trade => (
                                            <tr key={trade._id}>
                                                {editingTrade && editingTrade._id === trade._id ? (
                                                    <>
                                                        <td><input name="strikeName" value={editingTrade.strikeName || ''} onChange={handleChange} /></td>
                                                        <td><input name="quantity" type="number" value={editingTrade.quantity || ''} onChange={handleChange} /></td>
                                                        <td><input name="buyPrice" type="number" value={editingTrade.buyPrice || ''} onChange={handleChange} /></td>
                                                        <td><input name="sellPrice" type="number" value={editingTrade.sellPrice || ''} onChange={handleChange} /></td>
                                                        <td><input name="charges" type="number" value={editingTrade.charges || ''} onChange={handleChange} /></td>
                                                        <td><input name="brokerage" type="number" value={editingTrade.brokerage || ''} onChange={handleChange} /></td>
                                                        <td>₹{formatCurrency(editingTrade.profit)}</td>
                                                        <td>₹{formatCurrency(editingTrade.loss)}</td>
                                                        <td>
                                                            <button onClick={handleSaveEdit}>Save</button>
                                                            <button onClick={handleCancelEdit}>Cancel</button>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td>{trade.strikeName}</td>
                                                        <td>{trade.quantity}</td>
                                                        <td>₹{formatCurrency(trade.buyPrice)}</td>
                                                        <td>₹{formatCurrency(trade.sellPrice)}</td>
                                                        <td>₹{formatCurrency(trade.charges)}</td>
                                                        <td>₹{formatCurrency(trade.brokerage)}</td>
                                                        <td>
                                                            <span className="profit">
                                                                ₹{formatCurrency(trade.profit) || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="loss">
                                                                ₹{formatCurrency(trade.loss) || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button onClick={() => handleEditClick(trade)}>Edit</button>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="daily-charges-update">
                                    <input
                                        type="number"
                                        value={dailyCharges[date] || ''}
                                        onChange={(e) => handleDailyChargesChange(date, e.target.value)}
                                        placeholder="Enter daily charges"
                                        disabled={chargesUpdated[date]}
                                    />
                                    <button
                                        onClick={() => handleUpdateDailyCharges(date)}
                                        disabled={chargesUpdated[date]}
                                    >
                                        {chargesUpdated[date] ? 'Charges Updated' : 'Update Daily Charges'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </>
            ) : (
                <p>No trades available.</p>
            )}
        </div>
    );
};

export default AllTrades;
