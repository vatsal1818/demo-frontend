// PaymentModal.js
import React, { useState } from 'react';
import { X, CreditCard, AlertCircle, Loader } from 'lucide-react';
import { COURSES } from '../../helper/Apihelpers';
import './PaymentModel.css';

const PaymentModal = ({ isOpen, onClose, course, onSuccess, onError }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvc: '',
        name: ''
    });

    if (!isOpen) return null;

    // Validation helpers
    const validateCardNumber = (number) => {
        const regex = /^[\d\s]{16,19}$/;
        return regex.test(number.replace(/\s/g, ''));
    };

    const validateExpiry = (expiry) => {
        if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
        const [month, year] = expiry.split('/');
        const now = new Date();
        const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        return expDate > now;
    };

    const validateCVC = (cvc) => {
        return /^\d{3,4}$/.test(cvc);
    };

    const validateName = (name) => {
        return name.trim().length >= 3;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        switch (name) {
            case 'number':
                formattedValue = value
                    .replace(/\D/g, '')
                    .replace(/(\d{4})/g, '$1 ')
                    .trim()
                    .slice(0, 19);
                break;

            case 'expiry':
                formattedValue = value
                    .replace(/\D/g, '')
                    .replace(/(\d{2})(\d)/, '$1/$2')
                    .slice(0, 5);
                break;

            case 'cvc':
                formattedValue = value.replace(/\D/g, '').slice(0, 4);
                break;

            case 'name':
                formattedValue = value.replace(/[^a-zA-Z\s]/g, '');
                break;
        }

        setCardDetails(prev => ({
            ...prev,
            [name]: formattedValue
        }));

        // Clear error when user starts typing
        if (status.type === 'error') {
            setStatus({ type: '', message: '' });
        }
    };

    const validateForm = () => {
        if (!validateCardNumber(cardDetails.number)) {
            setStatus({
                type: 'error',
                message: 'Please enter a valid card number'
            });
            return false;
        }
        if (!validateExpiry(cardDetails.expiry)) {
            setStatus({
                type: 'error',
                message: 'Please enter a valid expiry date'
            });
            return false;
        }
        if (!validateCVC(cardDetails.cvc)) {
            setStatus({
                type: 'error',
                message: 'Please enter a valid CVC'
            });
            return false;
        }
        if (!validateName(cardDetails.name)) {
            setStatus({
                type: 'error',
                message: 'Please enter the cardholder name'
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch(`${COURSES}/${course._id}/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    paymentMethod: 'card',
                    cardDetails: {
                        ...cardDetails,
                        number: cardDetails.number.replace(/\s/g, '')
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Payment failed');
            }

            setStatus({
                type: 'success',
                message: 'Payment successful! Redirecting...'
            });

            setTimeout(() => {
                onSuccess(data);
                onClose();
            }, 2000);

        } catch (err) {
            setStatus({
                type: 'error',
                message: err.message || 'Payment failed. Please try again.'
            });
            onError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal-container">
                <button className="payment-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="payment-modal-header">
                    <h2 className="payment-modal-title">
                        <CreditCard className="payment-modal-icon" size={24} />
                        Complete Purchase
                    </h2>
                    <p className="payment-modal-subtitle">
                        Purchase {course?.courseName} for ${course?.price?.toFixed(2)}
                    </p>
                </div>

                {status.message && (
                    <div className={`payment-modal-message ${status.type}`}>
                        <AlertCircle size={20} />
                        <span>{status.message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="payment-modal-form">
                    <div className="payment-form-group">
                        <label htmlFor="name">Cardholder Name</label>
                        <input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={cardDetails.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="payment-form-group">
                        <label htmlFor="number">Card Number</label>
                        <input
                            id="number"
                            name="number"
                            placeholder="1234 5678 9012 3456"
                            value={cardDetails.number}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="payment-form-row">
                        <div className="payment-form-group">
                            <label htmlFor="expiry">Expiry Date</label>
                            <input
                                id="expiry"
                                name="expiry"
                                placeholder="MM/YY"
                                value={cardDetails.expiry}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="payment-form-group">
                            <label htmlFor="cvc">CVC</label>
                            <input
                                id="cvc"
                                name="cvc"
                                placeholder="123"
                                value={cardDetails.cvc}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`payment-submit-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader className="payment-spinner" size={20} />
                                Processing...
                            </>
                        ) : (
                            `Pay $${course?.price?.toFixed(2)}`
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;