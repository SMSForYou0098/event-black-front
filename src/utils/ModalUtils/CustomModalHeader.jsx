import { X } from "lucide-react";
import { Modal } from "react-bootstrap";

const CustomHeader = ({ title, closable ,onClose }) => (
    <Modal.Header className="p-0 m-0 px-4 py-3">
      <h4 className="p-0 m-0">{title}</h4>
      {closable && <X className="cursor-pointer" onClick={onClose} />}
    </Modal.Header>
  );

export default CustomHeader;
export { CustomHeader };