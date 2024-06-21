import { useEffect, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";

export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({imageUrls:[],});
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [isImageUploading, setIsImageUploading]= useState(false);
  console.log(formData);

  useEffect(()=>{
    setUploadedUrls(formData.imageUrls);
  }, [formData.imageUrls])

  const handleImageSubmit = (e) => {
    e.preventDefault();
    setIsImageUploading(true); // Set isImageUploading to true when uploading starts

    if ( files.length > 0 && files.length < 7 && formData.imageUrls.length + files.length < 7) {
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }

      Promise.all(promises)
        .then((urls) => {
          setFormData({...formData, imageUrls:formData.imageUrls.concat(urls)});
          setIsImageUploading(false); // Set isImageUploading to false when uploading finishes
        })
        .catch((error) => {
          console.error("Error uploading images:", error);
          setIsImageUploading(false); // Set isImageUploading to false in case of an error
        });
    } else {
      alert("Please select between 1 and 6 images.");
      setIsImageUploading(false); // Set isImageUploading to false if invalid file count
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Handle progress
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

//   const deleteImage = (index) => {
//   const updatedUrls = [...uploadedUrls];
//   updatedUrls.splice(index, 1);
//   setUploadedUrls(updatedUrls);
// };

   const handleRemoveImage= (index) =>{
    const updatedUrls = [...uploadedUrls];
    updatedUrls.splice(index, 1);
    setUploadedUrls(updatedUrls);
    setFormData({
      ...formData,
      imageUrls:formData.imageUrls.filter((_,i) => i !==index),
    });
   };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a listing
      </h1>
      <form className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="rent" className="w-5" />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="parking" className="w-5" />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="furnished" className="w-5" />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="offer" className="w-5" />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="discountPrice"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
              />
              <div className="flex flex-col items-center">
                <p>Discounted price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              onClick={handleImageSubmit}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-50"
              disabled={isImageUploading}
            >
              {isImageUploading? "Uploading...": "Upload"}
            </button>
          </div>
          <button className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80" disabled={isImageUploading}>
            Create Listing
          </button>
          {/* Section to display uploaded images */}
          {/* { uploadedUrls.length>0 &&
            <div className="mt-6">
            <h2 className="text-2xl font-semibold">Uploaded Images</h2>
            <div className="flex flex-wrap gap-4">
              {uploadedUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  width="100"
                  height="100"
                  className="object-cover border border-gray-300 rounded"
                />
              ))}
            </div>
          </div>} */}
          {uploadedUrls.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Uploaded Images</h2>
              <div className="space-y-4">  {/* Adjusted for vertical stacking */}
                {uploadedUrls.map((url, index) => (
                  <div key={index} className="relative flex items-center justify-between border p-4 rounded-corner">
                    <img
                      src={url}
                      alt={`Uploaded ${index + 1}`}
                      width="100"
                      height="100"
                      className="object-fill border border-gray-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={()=> handleRemoveImage(index)}
                      className="ml-4 text-red-700 rounded-lg uppercase hover:opacity-75"
                      // onClick={() => deleteImage(index)}
                    >
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </form>
    </main>
  );
}
