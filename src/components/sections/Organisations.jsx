import { Fragment, memo } from 'react';
import OrganisationEvents from '../slider/OrganisationEvents';

const Organisations = memo(() => {
  // perform api call
  return (
    <Fragment>
      <OrganisationEvents/>
    </Fragment>
  );
});

Organisations.displayName = 'Organisations';
export default Organisations;