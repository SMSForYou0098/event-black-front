import { Form, InputGroup } from "react-bootstrap"

export const InputWithIcon = ({ icon, setData , value , placeholder }) => {
    return (
        <InputGroup className=" rounded-3 overflow-hidden">
            <Form.Control
                placeholder={placeholder}
                value={value}
                size="sm"
                onChange={(e) => setData(e.target.value)}
                className="card-glassmorphism__input bg-dark rounded-end-0"
            />
            <button type="submit" className="block-search_button bg-primary text-white border-0 d-flex align-items-center justify-content-center px-3 rounded-start-0">
                {icon}
            </button>
        </InputGroup>
    )
}