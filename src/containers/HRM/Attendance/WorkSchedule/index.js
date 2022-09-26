import React from 'react';

// components
import Sidebar from './Sidebar';
import { NavigationButtons } from '../Shared';
import NameEdit from './NameEdit';
import Week from './Week';

export default function WorkSchedules() {
  return (
    <section>
      <Sidebar />
      <section className="scrollbar aside" id="workSchedulesArea">
        <div className="container">
          <NavigationButtons />

          <NameEdit />

          <Week />
        </div>
      </section>
    </section>
  );
}
