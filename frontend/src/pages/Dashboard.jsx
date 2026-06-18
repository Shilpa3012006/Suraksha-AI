import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


function Dashboard() {

  const navigate = useNavigate();


  useEffect(() => {

    const token = localStorage.getItem("access");


    if (!token) {

      navigate("/login");

    }

  }, []);


  const logout = () => {

    localStorage.removeItem("access");

    navigate("/login");

  };


  return (

    <div>

      <h1>Suraksha Dashboard</h1>

      <p>Welcome authenticated user</p>


      <button onClick={logout}>

        Logout

      </button>


    </div>

  );

}


export default Dashboard;