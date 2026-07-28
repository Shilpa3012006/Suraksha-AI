import { useState, useEffect } from "react";
import axios from "axios";

function TrustedContacts() {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        relationship: ""
    });

    const [contacts, setContacts] = useState([]);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    const fetchContacts = async () => {

        const token = localStorage.getItem("access");
    
        try {
    
            const response = await axios.get(
                "http://127.0.0.1:8000/api/trusted-contacts/list/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
    
            setContacts(response.data);
    
        } catch (error) {
    
            console.error(error);
    
        }
    
    };
    useEffect(() => {

        fetchContacts();
    
    }, []);

    const deleteContact = async (id) => {

        const token = localStorage.getItem("access");
    
        try {
    
            await axios.delete(
                `http://127.0.0.1:8000/api/trusted-contacts/delete/${id}/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
    
            alert("Trusted Contact Deleted!");
    
            fetchContacts();
    
        } catch (error) {
    
            console.error(error);
    
            alert("Failed to delete contact.");
    
        }
    
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const token = localStorage.getItem("access");

        try {

            await axios.post(
                "http://127.0.0.1:8000/api/trusted-contacts/",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Trusted Contact Added!");
            fetchContacts();

            setFormData({
                name: "",
                email: "",
                phone: "",
                relationship: ""
            });

        } catch (error) {

            console.error(error);

            alert("Failed to add trusted contact.");

        }

    };

    return (

        <div className="contacts-page">
        
            <div className="contacts-header">
        
                <div>
        
                    <h1 className="contacts-title">
                        Trusted Contacts
                    </h1>
        
                    <p className="contacts-subtitle">
                        Manage trusted people who can securely receive emergency evidence backups.
                    </p>
        
                </div>
        
            </div>
        
            <div className="contacts-grid">
        
                {/* LEFT COLUMN */}
        
                <div className="contacts-form-card">
        
                    <h2>Add Trusted Contact</h2>
        
                    <p>
                        Add a trusted family member or friend who can receive encrypted evidence backups.
                    </p>
        
                    <form
                        onSubmit={handleSubmit}
                        className="contacts-form"
                    >
        
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
        
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
        
                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
        
                        <input
                            type="text"
                            name="relationship"
                            placeholder="Relationship"
                            value={formData.relationship}
                            onChange={handleChange}
                            required
                        />
        
                        <button
                            type="submit"
                            className="contacts-btn"
                        >
                            Add Trusted Contact
                        </button>
        
                    </form>
        
                </div>
        
                {/* RIGHT COLUMN */}
        
                <div className="contacts-info-card">
        
                    <h3>Security Information</h3>
        
                    <div className="info-item">
                        <strong>Secure Backup</strong>
                        <p>Your evidence is securely backed up.</p>
                    </div>
        
                    <div className="info-item">
                        <strong>Emergency Access</strong>
                        <p>Trusted contacts can receive evidence when required.</p>
                    </div>
        
                    <div className="info-item">
                        <strong>Privacy First</strong>
                        <p>Your contacts cannot access files without authorization.</p>
                    </div>
        
                    <div className="info-item">
                        <strong>Encrypted Storage</strong>
                        <p>Evidence integrity remains protected.</p>
                    </div>
        
                </div>
        
            </div>
        
            <div className="contacts-list-section">
        
                <h2>
                    My Trusted Contacts
                </h2>
        
                {
        
                    contacts.length === 0 ?
        
                    (
        
                        <div className="contacts-empty">
        
                            <h3>No Trusted Contacts</h3>
        
                            <p>
                                Add your first trusted contact to enable secure emergency backups.
                            </p>
        
                        </div>
        
                    )
        
                    :
        
                    (
        
                        <div className="contacts-list">
        
                            {
        
                                contacts.map((contact) => (
        
                                    <div
                                        key={contact.id}
                                        className="contact-card"
                                    >
        
                                        <div className="contact-avatar">
        
                                            {contact.name.charAt(0).toUpperCase()}
        
                                        </div>
        
                                        <div className="contact-details">
        
                                            <h3>{contact.name}</h3>
        
                                            <p>{contact.email}</p>
        
                                            <p>{contact.phone}</p>
        
                                            <p>
        
                                                <strong>Relationship:</strong>{" "}
                                                {contact.relationship}
        
                                            </p>
        
                                        </div>
        
                                        <button
                                            className="delete-btn"
                                            onClick={() => deleteContact(contact.id)}
                                        >
                                            Delete
                                        </button>
        
                                    </div>
        
                                ))
        
                            }
        
                        </div>
        
                    )
        
                }
        
            </div>
        
        </div>
        
        );

}

export default TrustedContacts;