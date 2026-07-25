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

        <div style={{ padding: "30px" }}>

            <h2>Trusted Contacts</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <input
                    type="text"
                    name="relationship"
                    placeholder="Relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <button type="submit">

                    Add Trusted Contact

                </button>

            </form>
            <hr />

            <h3>My Trusted Contacts</h3>
            
            {contacts.length === 0 ? (
            
                <p>No trusted contacts added yet.</p>
            
            ) : (
            
                contacts.map((contact) => (
            
                    <div
                        key={contact.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "10px",
                            marginBottom: "10px"
                        }}
                    >
            
                        <h4>{contact.name}</h4>
            
                        <p>Email: {contact.email}</p>
            
                        <p>Phone: {contact.phone}</p>
            
                        <p>Relationship: {contact.relationship}</p>

                        <button
                            onClick={() => deleteContact(contact.id)}
                        >
                            Delete
                        </button>
            
                    </div>
            
                ))
            
            )}

        </div>

    );

}

export default TrustedContacts;