import React, { useEffect, useState, useRef } from 'react';
import './Dashboard.css';
const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [longUrl, setLongUrl] = useState('');
    const [shortenedUrl, setShortenedUrl] = useState('');
    const [shortenedUrlDetails, setShortenedUrlDetails] = useState(null);
    const [originalUrlDetails, setOriginalUrlDetails] = useState(null);
    const clickCountRef = useRef(0);
    const [clickCount, setClickCount] = useState(0);
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setUserData(null);
        window.location.href = '/';
    };
    const fetchProtectedData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                handleLogout();
                return;
            }

            const response = await fetch('https://urslhashingtask-production.up.railway.app/auth/protected', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error fetching protected data:', errorData);
            } else {
                const data = await response.json();
                console.log('Protected data:', data);
                const { user } = data;
                const { username } = user;
                console.log('Extracted username:', username);
                setUserData(prevUserData => ({ ...prevUserData, username }));
            }
        } catch (error) {
            console.error('Error fetching protected data:', error);
        }
    };
    const handleUrlShorten = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                handleLogout();
                return;
            }

            const response = await fetch('https://urslhashingtask-production.up.railway.app/api/url/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ longUrl }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error shortening URL:', errorData);
            } else {
                const data = await response.json();
                console.log('Shortened URL details:', data);
                setShortenedUrl(data.shortUrl);
                setShortenedUrlDetails(data);
            }
        } catch (error) {
            console.error('Error shortening URL:', error);
        }
    };
    const fetchOriginalUrlDetails = async (shortHash) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                handleLogout();
                return;
            }

            const response = await fetch(`https://urslhashingtask-production.up.railway.app/api/url/${shortHash}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error fetching original URL details:', errorData);
                if (response.status === 404) {
                    alert('This link has expired.');
                }
            } else {
                const data = await response.json();
                console.log('Original URL details:', data);
                setOriginalUrlDetails(data);
            }
        } catch (error) {
            console.error('Error fetching original URL details:', error);
        }
    };

    const handleMenuClick = (menuItem) => {
        if (menuItem === 'originalUrl' && shortenedUrlDetails) {
            setClickCount((prevCount) => prevCount + 1);
            clickCountRef.current = clickCountRef.current + 1;

            if (clickCountRef.current === 2) {
                alert('This link will expire after the next click.');
            }

            fetchOriginalUrlDetails(shortenedUrlDetails.shortUrl.shortHash);
        }
    };
    useEffect(() => {
        setClickCount(0);
        clickCountRef.current = 0;
    }, [shortenedUrlDetails]);
    useEffect(() => {
        const storedUserData = JSON.parse(localStorage.getItem('userData'));
        if (storedUserData) {
            setUserData(storedUserData);
            fetchProtectedData();
        } else {
            handleLogout();
        }
    }, []);

    return (
        <div className="dashboard-container">
            <aside className="dashboard-sidebar">
                <div className="logo">Your Logo</div>
                <nav>
                    <ul>
                        <li>Dashboard</li>
                        <li onClick={() => handleMenuClick('originalUrl')}>Original Url</li>
                    </ul>
                </nav>
                <div className="user-info">
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </aside>

            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h1>Welcome to Your Dashboard</h1>
                    <p>{userData ? userData.username : 'Guest'}</p>
                </header>
                <div className="shorten-url-form">
                    <input
                        type="text"
                        placeholder="https://example.com/page?utm_source=email&utm_medium=marketing&utm_campaign=spring_sale"
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                    />
                    <button onClick={handleUrlShorten}>Shorten URL</button>
                </div>
                {shortenedUrlDetails && (
                    <div className="shortened-url">
                        <p>Shortened URL details:</p>
                        <ul>
                            <li>
                                <strong>Short Hash:</strong> {shortenedUrlDetails.shortUrl.shortHash}
                            </li>
                            <li>
                                <strong>Long URL:</strong> {shortenedUrlDetails.shortUrl.longUrl}
                            </li>
                            <li>
                                <strong>Click Count:</strong> {shortenedUrlDetails.shortUrl.clickCount}
                            </li>
                            <li>
                                <strong>max Clicks:</strong> {shortenedUrlDetails.shortUrl.maxClicks}
                            </li>
                            <li>
                                <strong>createdBy:</strong> {shortenedUrlDetails.shortUrl.createdBy}
                            </li>
                        </ul>
                    </div>
                )}
                {originalUrlDetails && (
                    <div className="original-url-details">
                        <p>Original URL details:</p>
                        <ul>
                            <li>
                                <strong>Original URL:</strong> {originalUrlDetails.originalUrl}
                            </li>
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
