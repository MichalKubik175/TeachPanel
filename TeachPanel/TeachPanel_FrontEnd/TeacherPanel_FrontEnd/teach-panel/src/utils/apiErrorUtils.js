export const extractErrorMessage = (responseData, includeProperty = false) => {
    if (!responseData?.errors || !Array.isArray(responseData.errors)) {
        return null;
    }

    if (responseData.errors.length === 0) {
        return null;
    }

    const firstErrorNode = responseData.errors[0];

    let message = firstErrorNode.messages[0];

    if (includeProperty && firstErrorNode.property) {
        message = `${firstErrorNode.property}: ${message}`;
    }

    return message;
}

export const extractErrorMessagesList = (responseData) => {
    if (!responseData?.errors || !Array.isArray(responseData.errors)) {
        return {};
    }

    const errors = {};

    responseData.errors.forEach(error => {
        if (error.property === null) {
            error.property = "_";
        }

        if (error.messages && Array.isArray(error.messages) && error.messages.length > 0) {
            errors[error.property] = error.messages[0];
        } else {
            errors[error.property] = "Value is invalid";
        }
    });

    return errors;
}

export const extractGenericErrorMessage = (responseData) => {
    const errorNode = responseData?.errors?.find(e => e.property === null || e.property === "_");

    if (errorNode && errorNode.messages && Array.isArray(errorNode.messages) && errorNode.messages.length > 0) {
        return errorNode.messages[0];
    }

    return null;
}

export const isValidationError = (responseData) => {
    return responseData?.errorType === 'VALIDATION_FAILED' || responseData?.errorType === 'MODEL_VALIDATION_FAILED';
}