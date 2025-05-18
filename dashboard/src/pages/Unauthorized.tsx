import { useNavigate } from 'react-router-dom';

function Unauthorized() {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/');
    };

    return (
        <div className="p-10 text-5xl text-center">
            <h1>401 Unauthorized</h1>
            <p className="text-2xl my-4">抱歉，您沒有權限查看這個頁面。</p>
            <button
                onClick={handleLogin}
                className="mt-6 py-2 px-4 bg-white border border-gray-500 text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700"
            >
                登入
            </button>
        </div>
    );
}

export default Unauthorized;
