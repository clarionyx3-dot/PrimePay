import React, { useState } from 'react';
import axios from 'axios';

const AddMenu = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Burgers');
    const [customCategory, setCustomCategory] = useState('');
    const [recipeRaw, setRecipeRaw] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); // Naya progress tracker

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!image) return alert("Bhai, photo select karein!");

        const finalCategory = category === "Other" ? customCategory : category;
        if (!finalCategory) return alert("Bhai, category ka naam toh likho!");

        // RECIPE LOGIC: "Bun:1, Patty:1" -> Array of Objects
        const recipe = recipeRaw.split(',').map(item => {
            const parts = item.split(':');
            if (parts.length < 2) return null;
            return { name: parts[0].trim(), amount: parseFloat(parts[1]) || 0 };
        }).filter(r => r !== null && r.name !== "");

        setLoading(true);
        setUploadProgress(20); // Progress Start

        try {
            const formData = new FormData();
            formData.append('file', image);
            formData.append('upload_preset', 'primepay_preset'); 

            // Cloudinary Upload
            const cloudRes = await fetch('https://api.cloudinary.com/v1_1/dfphcwvin/image/upload', {
                method: 'POST',
                body: formData
            });
            
            setUploadProgress(60); // Mid progress
            
            const cloudData = await cloudRes.json();
            if (!cloudData.secure_url) throw new Error("Cloudinary upload failed");

            // Final API Call to your Node.js Backend
            await axios.post('http://localhost:5000/api/menu/add', {
                name,
                price: parseFloat(price),
                category: finalCategory,
                imageUrl: cloudData.secure_url,
                recipe: recipe,
                restaurantId: "res_1778387070047" 
            });

            setUploadProgress(100);
            alert(`Mubarak ho! ${name} live ho gaya! 🚀`);
            
            // Reset
            setName(''); setPrice(''); setImage(null); setCustomCategory(''); setRecipeRaw('');
            setUploadProgress(0);
        } catch (err) {
            console.error(err);
            alert("Masla aa gaya: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', padding: '35px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
                <h2 style={{ textAlign: 'center', fontFamily: 'Syne', fontWeight: 800, color: '#1B2559', marginBottom: '30px' }}>🍔 Menu Studio</h2>
                
                <form onSubmit={handleAddProduct}>
                    {/* Progress Bar (Sirf tab dikhega jab loading ho) */}
                    {loading && (
                        <div style={{ width: '100%', height: '4px', background: '#EDF2F7', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
                            <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#0052FF', transition: '0.3s' }}></div>
                        </div>
                    )}

                    <div style={fieldGroup}>
                        <label style={labelStyle}>Product Name</label>
                        <input style={inputStyle} type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Double Cheese Burger" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={labelStyle}>Price ($)</label>
                            <input style={inputStyle} type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Category</label>
                            <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="Burgers">🍔 Burgers</option>
                                <option value="Pizza">🍕 Pizza</option>
                                <option value="Drinks">🥤 Drinks</option>
                                <option value="Other">✨ Custom</option>
                            </select>
                        </div>
                    </div>

                    {category === "Other" && (
                        <div style={customBoxStyle}>
                            <label style={labelStyle}>Custom Category Name</label>
                            <input style={inputStyle} type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} required placeholder="e.g. Desserts" />
                        </div>
                    )}

                    <div style={recipeSectionStyle}>
                        <label style={labelStyle}>Inventory Mapping (Recipe)</label>
                        <textarea 
                            style={{ ...inputStyle, height: '60px', resize: 'none' }} 
                            placeholder="Bun:1, Patty:2, Cheese:1" 
                            value={recipeRaw}
                            onChange={(e) => setRecipeRaw(e.target.value)}
                        />
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#718096' }}>
                             Format: <b>Ingredient : Qty</b> (separate with commas)
                        </div>
                    </div>

                    <div style={{ marginBottom: '25px', marginTop: '20px' }}>
                        <label style={labelStyle}>Dish Image</label>
                        <div style={uploadAreaStyle}>
                            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                        {loading ? 'Publishing Dish...' : 'Add to Menu'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- STYLES ---
const labelStyle = { fontSize: '12px', fontWeight: '800', color: '#A3AED0', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' };
const fieldGroup = { marginBottom: '20px' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', boxSizing: 'border-box', outline: 'none', background: '#F8FAFC', fontSize: '15px' };
const customBoxStyle = { marginBottom: '20px', padding: '15px', background: '#F0F9FF', borderRadius: '15px', border: '1px solid #BAE6FD' };
const recipeSectionStyle = { marginBottom: '20px', padding: '15px', background: '#F8FAFC', borderRadius: '15px', border: '1px solid #E2E8F0' };
const uploadAreaStyle = { padding: '15px', border: '2px dashed #E2E8F0', borderRadius: '15px', textAlign: 'center', background: '#FAFAFA' };
const buttonStyle = (loading) => ({ width: '100%', padding: '18px', backgroundColor: loading ? '#CBD5E1' : '#0052FF', color: 'white', border: 'none', borderRadius: '15px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '800', fontSize: '16px', boxShadow: loading ? 'none' : '0 10px 20px rgba(0,82,255,0.2)', transition: '0.3s' });

export default AddMenu;