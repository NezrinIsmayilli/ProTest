import React from 'react';
import EmployeeForm from '../Shared/EmployeeForm';

function WorkerForm() {
  return <EmployeeForm fromForm={1} />;
}

WorkerForm.displayName = 'WorkerForm';

export default WorkerForm;
