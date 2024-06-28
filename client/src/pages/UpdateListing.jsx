

import { useEffect, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'

export default function CreateListing() {
  const{currentUser} = useSelector(state => state.user) 
  const navigate = useNavigate()
  const params = useParams();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls:[],
    name: '',
    description:'',
    address:'',
    type:'rent',
    bedrooms:1,
    bathrooms:1,
    regularPrice:50,
    discountPrice:0,
    offer:false,
    parking:false,
    furnished:false,
  
  });
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [isImageUploading, setIsImageUploading]= useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
      const fetchListing = async () => {
           const listingId = params.listingId;
           const res = await fetch(`/api/listing/get/${listingId}`);
           const data = await res.json();
           if(data.success === false){
            console.log(data.message);
            return;
           }
           setFormData(data);
      };
      fetchListing();
  },[]);

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

   const handleChange = (e) =>{
    if(e.target.id === 'sale' || e.target.id==='rent'){
      setFormData({
        ...formData,
        type : e.target.id
      })
    }

    if(e.target.id==='parking' || e.target.id==='furnished' || e.target.id==='offer'){
      setFormData({
        ...formData,
        [e.target.id]:e.target.checked
      })
    }

    if(e.target.type==='number' || e.target.type==='text' || e.target.type==='textarea'){
      setFormData({
        ...formData,
        [e.target.id]:e.target.value
      })
    }

   };

   const handleSubmit = async (e) => {
        e.preventDefault();
        try{
          if(formData.imageUrls.length<1) return setError('You must upload atleast one image')
          if(+formData.regularPrice <+formData.discountPrice)
            return setError('Discount price must be smaller than regular price')  
          setLoading(true);
          setError(false);
          const res  = await fetch (`/api/listing/update/${params.listingId}`,{
            method:'POST',
            headers:{
              'Content-Type':'application/json',
            },
            body:JSON.stringify({
              ...formData,
              userRef:currentUser._id,
            }),
          });
          const data = await res.json();
          setLoading(false);
          if(data.success=== false){
            setError(data.message);
          } 
          navigate(`/listing/${data._id}`)
    } catch(error){
          setError(error.message);
          setLoading(false);
    }
   };
  
  
  
  

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Update a listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" onChange={handleChange} checked={formData.type === 'sale'}/>
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="rent" className="w-5" onChange={handleChange} checked={formData.type === 'rent'} />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="parking" className="w-5" onChange={handleChange} checked={formData.parking} />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="furnished" className="w-5" onChange={handleChange} checked={formData.furnished} />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="offer" className="w-5" onChange={handleChange} checked={formData.offer}/>
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
                onChange={handleChange} value={formData.bedrooms}
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
                onChange={handleChange} value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="1000000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange} value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>
            {formData.offer && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="discountPrice"
                min="0"
                max="1000000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange} value={formData.discountPrice}
              />
              <div className="flex flex-col items-center">
                <p>Discounted price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>
            )}
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
            {loading ? 'Updating...':'Update listing'}
          </button>
          {error && <p className="text-red-700 text-sm"> {error} </p>}
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

