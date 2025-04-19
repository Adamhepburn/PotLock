import { useState } from "react";

function AppTest() {
  const [isLoaded, setIsLoaded] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">PotLock Test Page</h1>
        
        <p className="mb-4 text-gray-700">
          If you can see this page, the application is loading correctly.
        </p>
        
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md">
          ✓ React is rendering correctly
        </div>
        
        <button 
          className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => alert("Button works!")}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

export default AppTest;