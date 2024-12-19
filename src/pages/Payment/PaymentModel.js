import React, { useState, useEffect } from 'react';
import { X, CreditCard, AlertCircle, Loader, Tag, Percent, DollarSign } from 'lucide-react';
import { COURSES, USER_COUPON, USER_AVAILABLE_COUPON, USER_VALIDATE_COUPON } from '../../helper/Apihelpers';
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
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [finalPrice, setFinalPrice] = useState(course?.offerPrice || course?.price);

    const fetchApplicableCoupons = async () => {
        if (!course?._id) return;

        try {
            // Fetch course-specific coupons
            const courseCouponsResponse = await fetch(`${USER_COUPON}/course/${course._id}`, {
                credentials: 'include'
            });
            const courseCouponsData = await courseCouponsResponse.json();

            if (!courseCouponsResponse.ok) {
                throw new Error(courseCouponsData.message || 'Failed to fetch course coupons');
            }

            // Get valid coupons (course-specific and global)
            const validCoupons = courseCouponsData.data.filter(coupon => {
                // Check if coupon is either for this course or is global
                const isApplicable = coupon.courseId === course._id || coupon.courseId === null;

                // Check if coupon is still valid (you might want to add date validation here)
                const isValid = true; // Add your validation logic here

                return isApplicable && isValid;
            });

            setAvailableCoupons(validCoupons);

        } catch (error) {
            console.error('Error fetching coupons:', error);
            setAvailableCoupons([]); // Reset to empty array on error
        }
    };

    useEffect(() => {
        if (course) {
            fetchApplicableCoupons();
            setAppliedCoupon(null);
            setCouponCode('');
            setFinalPrice(course?.offerPrice || course?.price);
        }
    }, [course]);

    const handleCouponApply = async () => {
        if (!couponCode) return;

        setLoading(true);
        try {
            const response = await fetch(USER_VALIDATE_COUPON, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    code: couponCode,
                    amount: course?.offerPrice || course?.price,
                    courseId: course?._id  // Add courseId to validation
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setAppliedCoupon(data);
            setFinalPrice(data.finalAmount);
            setStatus({
                type: 'success',
                message: `Coupon applied! You saved ${data.discountType === 'percentage'
                    ? `${data.discount}%`
                    : `$${data.discountAmount.toFixed(2)}`
                    }`
            });

        } catch (err) {
            setStatus({
                type: 'error',
                message: err.message
            });
        } finally {
            setLoading(false);
        }
    };


    const handleCouponRemove = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setFinalPrice(course?.offerPrice || course?.price);
        setStatus({ type: '', message: '' });
    };


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
                    },
                    couponCode: appliedCoupon?.code
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

    if (!isOpen) return null;

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
                        Purchase {course?.courseName} for ${finalPrice?.toFixed(2)}
                        {course?.offerPrice && (
                            <span className="original-price"> (Original price: ${course?.price?.toFixed(2)})</span>
                        )}
                    </p>
                </div>

                <div className="coupon-section">
                    <h3>Available Course Coupons</h3>
                    <div className="available-coupons">
                        {availableCoupons.length > 0 ? (
                            availableCoupons.map(coupon => (
                                <div key={coupon.code} className="coupon-item">
                                    {coupon.discountType === 'percentage' ? (
                                        <Percent size={16} className="coupon-icon" />
                                    ) : (
                                        <DollarSign size={16} className="coupon-icon" />
                                    )}
                                    <span className="coupon-code">{coupon.code}</span>
                                    <span className="coupon-discount">
                                        {coupon.discountType === 'percentage'
                                            ? `${coupon.discount}% OFF`
                                            : `$${coupon.discount} OFF`
                                        }
                                    </span>
                                    <button
                                        onClick={() => setCouponCode(coupon.code)}
                                        className="coupon-apply-btn"
                                    >
                                        Use
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No coupons available for this course</p>
                        )}
                    </div>

                    <div className="coupon-input-group">
                        <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            disabled={appliedCoupon}
                        />
                        {appliedCoupon ? (
                            <button
                                onClick={handleCouponRemove}
                                className="coupon-remove-btn"
                            >
                                Remove
                            </button>
                        ) : (
                            <button
                                onClick={handleCouponApply}
                                className="coupon-apply-btn"
                                disabled={!couponCode || loading}
                            >
                                Apply
                            </button>
                        )}
                    </div>
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

                    <div className="price-summary">
                        <div className="price-row">
                            <span>Original Price:</span>
                            <span>${course?.price?.toFixed(2)}</span>
                        </div>
                        {course?.offerPrice && (
                            <div className="price-row">
                                <span>Offer Discount:</span>
                                <span>-${(course.price - course.offerPrice).toFixed(2)}</span>
                            </div>
                        )}
                        {appliedCoupon && (
                            <div className="price-row">
                                <span>Coupon Discount:</span>
                                <span>
                                    {appliedCoupon.discountType === 'percentage'
                                        ? `-${appliedCoupon.discount}%`
                                        : `-$${appliedCoupon.discountAmount.toFixed(2)}`
                                    }
                                </span>
                            </div>
                        )}
                        <div className="price-row total">
                            <span>Final Price:</span>
                            <span>${finalPrice.toFixed(2)}</span>
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
                            `Pay $${finalPrice.toFixed(2)}`
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;