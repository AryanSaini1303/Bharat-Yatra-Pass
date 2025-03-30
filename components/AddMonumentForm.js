import { useEffect, useRef, useState } from "react";
import styles from "./AddMonumentForm.module.css";

const AddMonumentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    description: "",
    address: "",
    image: "",
    popularity: "",
    ticket_price: ["", "", "", ""], // Senior, Children, Adult, Foreigner
    opening_time: "",
    closing_time: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [imageURL, setImageURL] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      setFormData((prev) => {
        const updatedPrices = [...prev.ticket_price];
        updatedPrices[index] = value;
        return { ...prev, ticket_price: updatedPrices };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    // console.log(formData);
    if (!imageURL) {
      console.error("No image selected");
      return;
    }
    const formData = new FormData();
    formData.append("image", imageURL);
    const response = await fetch(`/api/uploadImage`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    console.log("Uploaded Image URL: ", data.imageData.publicUrl);
    setFormData((prev) => ({ ...prev, image: data.imageData.publicUrl }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0]; // Get the first selected file
    // console.log(file);
    setImageURL(file);
    if (file) {
      setPreviewImage(URL.createObjectURL(file)); // Convert to previewable URL
    }
  };

  useEffect(() => {
    if (Object.values(formData)[4] != 0) {
      const handleSubmit = async () => {
        const response = await fetch("/api/setMonuments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Monument added successfully:");
          alert("Monument added successfully:");
          setLoading(false);
          setFormData({
            name: "",
            city: "",
            description: "",
            address: "",
            image: "",
            popularity: "",
            ticket_price: ["", "", "", ""], // Senior, Children, Adult, Foreigner
            opening_time: "",
            closing_time: "",
          });
          setPreviewImage(null);
          setImageURL("");
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset file input field
          }
        } else {
          console.error("Error adding monument:", data.error);
          setLoading(false);
        }
      };
      handleSubmit();
    }
  }, [formData]);

  return (
    <div className={styles.formContainer}>
      {/* <h2>Add Monument</h2> */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <section>
          <input
            type="text"
            name="name"
            placeholder="Monument Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </section>
        <section>
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="popularity"
            placeholder="Popularity (1-5)"
            value={formData.popularity}
            onChange={handleChange}
            required
            min="1"
            max="5"
          />
        </section>
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <label className={styles.label}>Monument Image</label>
        <input
          type="file"
          accept="previewImage/*"
          onChange={handleImageChange}
          className={styles.fileInput}
          ref={fileInputRef}
        />

        {previewImage && (
          <img
            src={previewImage}
            alt="Preview"
            className={styles.imagePreview}
          />
        )}

        <div className={styles.ticketPrices}>
          <label>Ticket Prices:</label>
          <section>
            {formData.ticket_price.map((price, index) => (
              <input
                key={index}
                type="number"
                placeholder={
                  index == 0
                    ? "Senior"
                    : index == 1
                    ? "Children"
                    : index == 2
                    ? "Adult"
                    : "Foreiger"
                }
                value={price}
                onChange={(e) => handleChange(e, index)}
                required
              />
            ))}
          </section>
        </div>

        <div className={styles.timeInputs}>
          <label>Timings:</label>
          <section>
            <input
              type="time"
              name="opening_time"
              value={formData.opening_time}
              onChange={handleChange}
              required
            />
            <h3>&ndash;</h3>
            <input
              type="time"
              name="closing_time"
              value={formData.closing_time}
              onChange={handleChange}
              required
            />
          </section>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          style={
            loading ? { pointerEvents: "none", backgroundColor: "grey" } : null
          }
          disabled={loading}
        >
          {loading ? "Adding Monument..." : "Add Monument"}
        </button>
      </form>
    </div>
  );
};

export default AddMonumentForm;
