import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import * as S from "./styles";

import api from "../../services/api";

const Repositorio = () => {
  const [currentRepo, setCurrentRepo] = useState({});
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterIndex, setFilterIndex] = useState(0);

  const params = useParams();

  const filters = useMemo(
    () => [
      { state: "all", label: "Todas" },
      { state: "open", label: "Abertas" },
      { state: "closed", label: "Fechadas" },
    ],
    []
  );

  useEffect(() => {
    if (!params.repositorio) {
      return;
    }

    const loadRepo = () => {
      api
        .get(`/repos/${params.repositorio}`)
        .then(response => setCurrentRepo(response.data))
        .catch(error => console.error(error))
        .finally(() => setLoading(false));
    };

    loadRepo();
  }, [params]);

  useEffect(() => {
    const loadIssues = () => {
      api
        .get(`/repos/${params.repositorio}/issues`, {
          params: {
            state: filters[filterIndex].state,
            per_page: 5,
            page,
          },
        })
        .then(response => setIssues(response.data))
        .catch(error => console.error(error));
    };

    loadIssues();
  }, [params, page, filters, filterIndex]);

  const handlePage = action => {
    const newPage = action === "back" ? page - 1 : page + 1;
    setPage(newPage);
  };

  const handleFilter = index => {
    setFilterIndex(index);
  };

  if (loading) {
    return (
      <S.Loading>
        <h1>Carregando...</h1>
      </S.Loading>
    );
  }

  return (
    <S.Container>
      <S.BackButton to="/">
        <FaArrowLeft color="#000" size={30} />
      </S.BackButton>

      <S.Owner>
        <img src={currentRepo.owner.avatar_url} alt={currentRepo.owner.login} />
        <h1>{currentRepo.name}</h1>
        <p>{currentRepo.description}</p>
      </S.Owner>

      <S.FilterList $active={filterIndex}>
        {filters.map((filter, i) => (
          <button
            type="button"
            key={filter.label}
            onClick={() => handleFilter(i)}
          >
            {filter.label}
          </button>
        ))}
      </S.FilterList>

      <S.IssuesList>
        {issues.map(issue => (
          <li key={issue.id}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />

            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>

                {issue.labels.map(label => (
                  <span key={label.id}>{label.name}</span>
                ))}
              </strong>

              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
      </S.IssuesList>

      <S.PageActions>
        <button
          type="button"
          onClick={() => handlePage("back")}
          disabled={page === 1}
        >
          Voltar
        </button>

        <button type="button" onClick={() => handlePage("next")}>
          Próxima
        </button>
      </S.PageActions>
    </S.Container>
  );
};

export default Repositorio;
