import React, { useState, useEffect } from 'react';
import TextInput from "../components/textinput";
import CustomBtn from "../components/CustomBtn";
import { addAttendant } from '../services/addAttendantService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authHeader from "../services/auth-header";

const AddAttendant = () => {
  const navigate = useNavigate();

  const [attendantData, setAttendantData] = useState({
    phoneNo: '',
    parkingId: '',
    name: '',
    password: ''
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [parkings, setparkings] = useState([]);

  useEffect(() => {
    const getparkings = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        navigate("/");
      } else {
        setCurrentUser(user); 
        try {
          const response = await axios.get(
            'http://localhost:8081/api/operator/getParkings',
            { 
              params: { phoneNo: user.username }, 
              headers: authHeader() 
            }
          );          
          setparkings(response.data);
        } catch (error) {
          console.error('Failed to fetch parking areas', error);
        }
      }
    };

    getparkings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAttendantData({ ...attendantData, [name]: value });

    switch (name) {
      case 'name':
        validateName(value);
        break;
      case 'phoneNo':
        validatePhoneNo(value);
        break;
      case 'parkingId':
        validateParkingId(value);
        break;
      case 'password':
        validatePassword(value);
        break;
      default:
        break;
    }
  };

  const validateName = (name) => {
    let nameError = '';
    if (name.trim().length < 3) {
      nameError = 'Name must be at least 3 characters long';
    }
    setErrors((prevErrors) => ({ ...prevErrors, name: nameError }));
    return !nameError;
  };

  const validatePhoneNo = (phoneNo) => {
    let phoneError = '';
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNo)) {
      phoneError = 'Phone number must be 10 digits';
    }
    setErrors((prevErrors) => ({ ...prevErrors, phoneNo: phoneError }));
    return !phoneError;
  };

  const validateParkingId = (parkingId) => {
    let parkingIdError = '';
    if (parkingId.trim().length === 0) {
      parkingIdError = 'Parking Id is required';
    }
    setErrors((prevErrors) => ({ ...prevErrors, parkingId: parkingIdError }));
    return !parkingIdError;
  };

  const validatePassword = (password) => {
    let passwordError = '';
    if (password.length < 8) {
      passwordError = 'Password must be at least 8 characters long';
    } else {
      if (!/[A-Z]/.test(password)) {
        passwordError = 'Password must contain at least one uppercase letter';
      }
      if (!/[a-z]/.test(password)) {
        passwordError = 'Password must contain at least one lowercase letter';
      }
      if (!/[0-9]/.test(password)) {
        passwordError = 'Password must contain at least one number';
      }
      if (!/[!@#$%^&*]/.test(password)) {
        passwordError = 'Password must contain at least one special character';
      }
    }
    setErrors((prevErrors) => ({ ...prevErrors, password: passwordError }));
    return !passwordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isNameValid = validateName(attendantData.name);
    const isPhoneNoValid = validatePhoneNo(attendantData.phoneNo);
    const isParkingIdValid = validateParkingId(attendantData.parkingId);
    const isPasswordValid = validatePassword(attendantData.password);

    if (!isNameValid || !isPhoneNoValid || !isParkingIdValid || !isPasswordValid) return;

    try {
      await addAttendant(attendantData);
      toast.success('Attendant Added Successfully');
      navigate('/operatordashboard');
    } catch (error) {
      toast.error(error.response?.data || error.message);
    }
  };

  const getBorderColor = (fieldName) => {
    if (errors[fieldName]) return 'border-red-500';
    if (attendantData[fieldName] && !errors[fieldName]) return 'border-green-500';
    return 'border-gray-300';
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Add Attendant</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md flex flex-col gap-5">
        <div>
          <TextInput
            type="text"
            label="Name"
            placeholder="Enter attendant name"
            required
            value={attendantData.name}
            name="name"
            onChange={handleChange}
            borderColor={getBorderColor('name')}
            error={errors.name}
          />
          {errors.name && (
            <p className="text-red-500 mt-1 text-xs font-semibold pl-2">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <TextInput
            type="text"
            label="Phone Number"
            placeholder="Enter attendant phone number"
            required
            value={attendantData.phoneNo}
            name="phoneNo"
            onChange={handleChange}
            borderColor={getBorderColor('phoneNo')}
            error={errors.phoneNo}
          />
          {errors.phoneNo && (
            <p className="text-red-500 mt-1 text-xs font-semibold pl-2">
              {errors.phoneNo}
            </p>
          )}
        </div>
        <div>
        <label className="block text-sm font-medium text-gray-700">Parking Area</label>
          <select
            name="parkingId"
            value={attendantData.parkingId}
            onChange={handleChange}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${getBorderColor('parkingId')} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md`}
          >
            <option value="">Select Parking Area</option>
            {parkings.map(parking => ( 
              <option key={parking.parkingId} value={parking.parkingId}> 
                {parking.title} (ID: {parking.parkingId}) 
              </option> 
            ))} 
          </select>
          {errors.parkingId && (
            <p className="text-red-500 mt-1 text-xs font-semibold pl-2">
              {errors.parkingId}
            </p>
          )}
        </div>
        <div>
          <TextInput
            type="password"
            label="Password"
            placeholder="Enter Password"
            required
            value={attendantData.password}
            name="password"
            onChange={handleChange}
            borderColor={getBorderColor('password')}
            error={errors.password}
          />
          {errors.password && (
            <p className="text-red-500 mt-1 text-xs font-semibold pl-2">
              {errors.password}
            </p>
          )}
        </div>
        <CustomBtn
          text="Add Attendant"
          type="submit"
          textcolor="white"
        />
      </form>
    </div>
  );
};

export default AddAttendant;
