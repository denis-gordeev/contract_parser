import React from 'react';

const JsonViewer = ({ data }) => {
  const renderJson = (key, value) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <div style={{ marginLeft: '20px' }}>
          <strong>{key}:</strong>
          <div>{Object.entries(value).map(([subKey, subValue]) => renderJson(subKey, subValue))}</div>
        </div>
      );
    }
    return (
      <div style={{ marginLeft: '20px' }}>
        <strong>{key}:</strong> {value}
      </div>
    );
  };

  return <div>{Object.entries(data).map(([key, value]) => renderJson(key, value))}</div>;
};

export default JsonViewer;

