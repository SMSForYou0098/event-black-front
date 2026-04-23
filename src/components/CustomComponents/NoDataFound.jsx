import React from 'react'
import { Alert } from 'react-bootstrap'

const NoDataFound = ({ message, variant = "primary" }) => {
    return (
        <Alert variant={variant} className="text-center">
            {message || "No data found."}
        </Alert>
    )
}

export default NoDataFound