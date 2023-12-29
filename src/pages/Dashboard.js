import React, { useEffect, useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [longUrl, setLongUrl] = useState('');
    const [shortenedUrl, setShortenedUrl] = useState('');
    const [shortenedUrlDetails, setShortenedUrlDetails] = useState(null);
    const [originalUrlDetails, setOriginalUrlDetails] = useState(null);

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
                const { shorthash } = data;
                setShortenedUrl(data.shortUrl);
                setShortenedUrlDetails({ ...data, shorthash });
            }
        } catch (error) {
            console.error('Error shortening URL:', error);
        }
    };

    const handleOpenOriginalUrl = async (event) => {
        try {
            event.preventDefault(); 
            const token = localStorage.getItem('authToken');
            if (!token) {
                handleLogout();
                return;
            }
            if (shortenedUrlDetails && shortenedUrlDetails.shorthash) {
                const response = await fetch(`https://urslhashingtask-production.up.railway.app/api/url/${shortenedUrlDetails.shorthash}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error fetching original URL details:', errorData);
                } else {
                    const data = await response.json();
                    console.log('Original URL details:', data);
                    if (event.target.tagName.toLowerCase() === 'a') {
                        window.open(data.originalUrl, '_blank');
                    } else {
                        window.location.href = data.originalUrl;
                    }
                }
            } else {
                console.error('Shortened URL details are not available.');
            }
        } catch (error) {
            console.error('Error fetching original URL details:', error);
        }
    };


    useEffect(() => {
        fetchProtectedData();
    }, []);

    return (
        <div className="dashboard-container">
            <aside className="dashboard-sidebar">
                <div className="logo">Your Logo</div>
                <nav>
                    <ul>
                        <li>Dashboard</li>
                        <li onClick={handleOpenOriginalUrl}>Original Url</li>
                        {/* <button onClick={handleOpenOriginalUrl}>Open Original URL</button> */}
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
                                <strong>Short Url Link:</strong>{' '}
                                <a href={shortenedUrlDetails.shortUrl} target="_blank" rel="noopener noreferrer" onClick={handleOpenOriginalUrl}>
                                    {shortenedUrlDetails.shortUrl}
                                </a>
                            </li>

                        </ul>
                      
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
