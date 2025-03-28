import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Contain from '../components/container/Contain';
import { fetchResponses, deleteResponse, likeResponse, unlikeResponse } from '../store/responseSlice'; 
import communityService from '../appwrite/response';
import { Edit, Trash2, PlusCircle, Zap } from 'react-feather';
import Like from '../assets/heart.png'
import Unlike from '../assets/like.png'

function Community() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userData);
  const responses = useSelector((state) => state.response.responses);
  const [processingLikes, setProcessingLikes] = useState([]);

  useEffect(() => {
    dispatch(fetchResponses());
  }, [dispatch]);

  const handleResponseDelete = async (id) => {
    const userConfirm = window.confirm("Are your sure you want to delete your response?");
    if (!userConfirm) {
      return;
    }
    try {
      const response = responses.find((response) => response.$id === id);
      if (response && Array.isArray(response.images)) {
        const images = response.images;
        const deletePromises = images.map((image) => communityService.deleteFile(image));
        await Promise.all(deletePromises);
      }
      await dispatch(deleteResponse(id)).unwrap();
    } catch (error) {
      console.error('Response deletion failed', error);
    }
  };

  const handleLike = async (id) => {
    if (!user) {
      alert('You must be logged in to like a response');
      return;
    }

    if (processingLikes.includes(id)) return; // Prevent multiple rapid clicks

    setProcessingLikes([...processingLikes, id]);

    const response = responses.find((res) => res.$id === id);
    if (!response || !Array.isArray(response.likes)) {
      setProcessingLikes(processingLikes.filter((item) => item !== id));
      return;
    }

    const userId = user.$id;
    if (response.likes.includes(userId)) {
      try {
        await dispatch(unlikeResponse({ responseId: response.$id, userId })).unwrap();
      } catch (error) {
        console.error("Error unliking", error);
      }
    } else {
      try {
        await dispatch(likeResponse({ responseId: response.$id, userId })).unwrap();
      } catch (error) {
        console.error("Error liking", error);
      }
    }

    setProcessingLikes(processingLikes.filter((item) => item !== id));
  };

  return (
    <div className="p-4 min-h-screen bg-gray-900">
      <Contain>
        <div className="relative p-4 min-h-screen text-white bg-gray-800 rounded-lg shadow-md sm:p-6">
          <h1 className="text-2xl font-bold text-center sm:text-3xl">Community Responses</h1>

          <div className="mt-16 w-full lg:absolute lg:top-4 lg:right-4 lg:space-x-4 lg:flex lg:justify-end lg:items-center lg:w-auto">
            <Link
              to="/travelplanner"
              className="flex items-center px-4 py-1 mb-2 w-full max-w-xs text-white bg-purple-600 rounded-md transition-transform duration-300 hover:bg-purple-700 hover:scale-105 lg:w-auto lg:mb-0"
            >
              <Zap className="mr-2" /> AI Trip Planner
            </Link>
            {user && (
              <Link
                to="/experienceShareForm"
                className="flex items-center px-4 py-1 w-full max-w-xs text-white bg-blue-500 rounded-md transition-transform duration-300 hover:bg-blue-700 hover:scale-105 lg:w-auto"
              >
                <PlusCircle className="mr-2" /> Share your Travel Experience
              </Link>
            )}
          </div>
            
          <div className="mt-20">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.isArray(responses) &&
                responses.map((response) => (
                  <div key={response.$id} className="flex relative flex-col justify-between p-5 bg-gray-900 rounded-lg shadow-md hover:shadow-lg">
                    <div>
                      {user && (
                        <div className="flex items-center mb-2">
                          <button
                            className={`flex items-center justify-center p-1 text-white rounded-full transform transition-transform duration-300 ${
                              processingLikes.includes(response.$id) ? 'scale-125' : ''
                            }`}
                            onClick={() => handleLike(response.$id)}
                            disabled={processingLikes.includes(response.$id)}
                          >
                            {response.likes?.includes(user.$id) ? (
                              <img src={Unlike} width="24" alt="liked" />
                            ) : (
                              <img src={Like} width="24" alt="like" />
                            )}
                          </button>
                          <p className="ml-1 text-white">{response.likes?.length || 0}</p>
                        </div>
                      )}
                      <h2 className="mb-2 text-lg font-semibold text-green-400 sm:text-2xl">By {response.userName}</h2>
                      <p className="text-md sm:text-lg">Travelled to {response.touristPlaceName}</p>
                      <p className="text-sm sm:text-base">{response.location}</p>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <Link
                        to={`/response/${response.$id}`}
                        className="px-2 py-1 text-sm font-semibold text-white bg-green-500 rounded hover:bg-green-700 sm:text-base"
                      >
                        View
                      </Link>
                      <div className="flex space-x-2">
                        {user && user.$id === response.userId && (
                          <>
                            <button
                              className="flex justify-center items-center px-1 py-1 text-sm font-semibold text-white bg-red-500 rounded hover:bg-red-700 sm:text-base"
                              onClick={() => handleResponseDelete(response.$id)}
                            >
                              <Trash2 className="mr-1 sm:mr-2" />
                            </button>
                            <Link
                              to={`/updateresponse/${response.$id}`}
                              className="flex justify-center items-center px-1 py-1 text-sm font-semibold text-white bg-yellow-500 rounded hover:bg-yellow-700 sm:text-base"
                            >
                              <Edit className="mr-1 sm:mr-2" />
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Contain>
    </div>
  );
}

export default Community;
