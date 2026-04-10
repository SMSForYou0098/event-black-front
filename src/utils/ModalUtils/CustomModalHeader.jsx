import { X } from "lucide-react";
import { Modal } from "react-bootstrap";

const CustomHeader = ({ title, closable, onClose, className, extra }) => (
  <Modal.Header className={`p-0 m-0 px-4 py-3 ${className}`}>
    <h6 className="p-0 m-0">{title}</h6>
    <div className="d-flex align-items-center gap-3">
      {extra}
      {closable && <X className="cursor-pointer" onClick={onClose} />}
    </div>
  </Modal.Header>
);

export default CustomHeader;
export { CustomHeader };