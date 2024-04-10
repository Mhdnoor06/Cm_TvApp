import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Redirector({ redirectPath }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (redirectPath) {
      navigate(redirectPath);
    }
  }, [navigate, redirectPath]);

  return null;
}

export default Redirector;
