/* eslint-disable no-unused-vars */
import React, { memo, Fragment, useState } from "react";

// Recat-bootstrap
import { Row, Col } from "react-bootstrap";

// Components

// Router

//React-select
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Card from "../bootstrap/card";
import Link from "next/link";


const components = {
  DropdownIndicator: null,
};

export const customStyles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#0c112e" : "",
    color: state.isSelected ? "#ffff" : "",
    "&:hover": {
      backgroundColor: "#3a57e8",
      color: "#ffffff",
    },
  }),
};


const options = [
  { value: "Alabama", label: "Alabama" },
  { value: "Amalapuram", label: "Amalapuram" },
  { value: "Arizona", label: "Arizona" },
  { value: "Colorada", label: "Colorada" },
  { value: "Idaho", label: "Idaho" },
  { value: "Montana", label: "Montana" },
  { value: "Anakapalli", label: "Anakapalli" },
  { value: "Akkayapalem", label: "Akkayapalem" },
  { value: "Nebraska", label: "Nebraska" },
  { value: "New Maxico", label: "New Maxico" },
  { value: "North Dakota", label: "North Dakota" },
  { value: "Utah", label: "Utah" },
  { value: "Wyoming", label: "Wyoming" },
];
const group1 = {
  label: "California",
  value: "California",
};

const options1 = [
  {
    readonly: true,
    label: (
      <span>
        <strong>pacific Time zone</strong>
      </span>
    ),
  },
  { value: "Nevada", label: "Nevada" },
  { value: "Oregon", label: "Oregon" },
  { value: "Washington", label: "Washington" },
  {
    readonly: true,
    label: (
      <span>
        <strong>"Mountain Time zone"</strong>
      </span>
    ),
  },
  { value: "Arizona", label: "Arizona" },
  { value: "Colorada", label: "Colorada" },
  { value: "Idaho", label: "Idaho" },
  { value: "Montana", label: "Montana" },
  { value: "Nebraska", label: "Nebraska" },
  { value: "New Maxico", label: "New Maxico" },
  { value: "North Dakota", label: "North Dakota" },
  { value: "Utah", label: "Utah" },
  { value: "Wyoming", label: "Wyoming" },
  {
    readonly: true,
    label: (
      <span>
        <strong>"Central Time zone"</strong>
      </span>
    ),
  },
  { value: "Alabama", label: "Alabama" },
  { value: "Arkansas", label: "Arkansas" },
  { value: "Lowa", label: "Lowa" },
  { value: "Kansas", label: "Kansas" },
  { value: "Missouri", label: "Missouri" },
  { value: "Texas", label: "Texas" },
  { value: "South Dakota", label: "South Dakota" },
  { value: "Kentucky", label: "Kentucky" },
  { value: "Illinois", label: "Illinois" },
];

const group = {
  value: "first",
  label: "First",
};

const options2 = [
  {
    readonly: true,
    label: "Colours",
    options: [group],
  },
  { value: "Second", label: "Second (disabled)", isDisabled: true },
  { value: "three", label: "Three" },
  { value: "Four", label: "Four" },
  { value: "Five", label: "Five (disabled)", isDisabled: true },
  { value: "Six", label: "Six" },
  { value: "Seven", label: "Seven" },
  { value: "eight", label: "Eight" },
  { value: "nine", label: "nine (disabled)", isDisabled: true },
  { value: "ten", label: "Ten" },
];

const group2 = {
  value: "Arizona",
  label: "Arizona",
};

const group3 = {
  value: "Alabama",
  label: "Alabama",
};

const options3 = [
  { readonly: true, label: "pacific ", options: [group1] },
  { value: "Nevada", label: "Nevada" },
  { value: "Oregon", label: "Oregon" },
  { value: "Washington", label: "Washington" },
  {
    readonly: true,
    label: (
      <span>
        <strong> "Mountain Time zone"</strong>
      </span>
    ),
    options: [group2],
  },
  { value: "Arizona", label: "Arizona" },
  { value: "Colorada", label: "Colorada" },
  { value: "Idaho", label: "Idaho" },
  { value: "Montana", label: "Montana" },
  { value: "Nebraska", label: "Nebraska" },
  { value: "New Maxico", label: "New Maxico" },
  { value: "North Dakota", label: "North Dakota" },
  { value: "Utah", label: "Utah" },
  { value: "Wyoming", label: "Wyoming" },
  {
    readonly: true,
    label: (
      <span>
        <strong>"Central Time zone"</strong>
      </span>
    ),
    options: [group3],
  },
  { value: "Alabama", label: "Alabama" },
  { value: "Arkansas", label: "Arkansas" },
  { value: "Lowa", label: "Lowa" },
  { value: "Kansas", label: "Kansas" },
  { value: "Missouri", label: "Missouri" },
  { value: "Texas", label: "Texas" },
  { value: "South Dakota", label: "South Dakota" },
  { value: "Kentucky", label: "Kentucky" },
  { value: "Illinois", label: "Illinois" },
];

const options4 = [
  {
    readonly: true,
    label: (
      <span>
        <strong>"UK"</strong>
      </span>
    ),
    options: [group1],
  },
  { value: "London", label: "London" },
  { value: "Manchester", label: "Manchester" },
  {
    readonly: true,
    label: (
      <span>
        <strong> "Franceeee"</strong>
      </span>
    ),
    options: [group2],
  },
  { value: "Paris", label: "Paris" },
  { value: "Marseille", label: "Marseille" },
  {
    readonly: true,
    label: (
      <span>
        <strong>"Mountain Time zone"</strong>
      </span>
    ),
    options: [group3],
  },
  { value: "Arizona", label: "Arizona" },
  { value: "Colorada", label: "Colorada" },
  { value: "Idaho", label: "Idaho" },
  { value: "Montana", label: "Montana" },
  { value: "Nebraska", label: "Nebraska" },
  { value: "New Maxico", label: "New Maxico" },
  { value: "North Dakota", label: "North Dakota" },
  { value: "Utah", label: "Utah" },
  { value: "Wyoming", label: "Wyoming" },
];

const options5 = [
  { value: "orange", label: "orange" },
  { value: "white", label: "white" },
  { value: "purple", label: "purple" },
];

const Select2 = memo((props) => {
  const [inputValue, setInputValue] = useState("");
  const [value, setValue] = useState([]);

  return (
    <Fragment>
      <Row>
        <Col lg="12">
          <Card>
            <Card.Body>
              <div className="d-flex flex-wrap align-items-center justify-content-between">
                <div className="d-flex flex-wrap align-items-center">
                  <div className="d-flex flex-wrap align-items-center mb-3 mb-sm-0">
                    <h4 className="me-2 h4">Select2</h4>
                  </div>
                </div>
                <small>
                  For more Information regarding Select2 Plugin refer
                  <Link href="">Documentation</Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg="6">
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <h4 className="mb-0">Single select boxes</h4>
                <p>
                  Select2 can take a regular select box. By default it supports
                  all options and operations that are available in a standard
                  select box,but with added flexibility.
                </p>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <Select options={options} styles={customStyles} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg="6">
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <h4 className="mb-0">Multiple select boxes</h4>
                <p>
                  Select2 also supports multi-value select boxes. The select
                  below is declared with the multiple attribute. We can select
                  multiple data in One time.
                </p>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div className="card-body-inner">
                <Select options={options1} isMulti styles={customStyles} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg="6">
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <h4 className="mb-0">Disabled Results</h4>
                <p>
                  Select2 will correctly handle disabled results, both with data
                  coming from a standard select (when the disabled attribute is
                  set) and from remote sources, where the object has disabled:
                  true set.
                </p>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <Select options={options2} styles={customStyles} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg="6">
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <h4 className="mb-0">Limiting the number of selections</h4>
                <p>
                  Select2 multi-value select boxes can set restrictions
                  regarding the maximum number of options selected. The select
                  below is declared with the multiple attribute with
                  maximumSelectionLength.
                </p>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <Select options={options3} isMulti styles={customStyles} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg="6">
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <h4 className="mb-0">Theme Support</h4>
                <p>
                  Select2 supports custom themes using the theme option so you
                  can style Select2 to match the rest of your application.These
                  examples use the classic theme.
                </p>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <Select options={options4} isMulti styles={customStyles} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg="6">
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <h4 className="mb-0">Placeholder</h4>
                <p>
                  A placeholder value can be defined and will be displayed until
                  a selection is made. Select2 uses the placeholder attribute on
                  multiple select boxes
                </p>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <Select options={options4} isMulti styles={customStyles} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg="6">
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <h4 className="mb-0">Dynamic Option Creation</h4>
                <p>
                  In addition to a prepopulated menu of options, Select2 can
                  dynamically create new options from text input by the user in
                  the search box. This feature is called "tagging". To enable
                  tagging, set the tags option to true:
                </p>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <CreatableSelect
                isClearable
                options={options5}
                tabSelectsValue
                isMulti
                styles={customStyles}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col lg="6">
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <h4 className="mb-0">Multi value Select Boxes</h4>
                <p>
                  Tagging can also be used in multi-value select boxes. In the
                  example below, we set the multiple="multiple" attribute on a
                  Select2 control that also has tags: true enabled:
                </p>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <Select options={options5} isMulti styles={customStyles} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg="6">
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <h4 className="mb-0">Automatic Tokenization into tags</h4>
                <p>
                  Select2 supports ability to add choices automatically as the
                  user is typing into the search field. Try typing in the search
                  field below and entering a space or a comma. The separators
                  that should be used when tokenizing can be specified using the
                  tokenSeparators options.
                </p>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <Select options={options5} isMulti styles={customStyles} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
});

Select2.displayName = "Select2";
export default Select2;
