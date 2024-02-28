import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaBars, FaGithub, FaPlus, FaSpinner, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import * as S from "./styles";

import api from "../../services/api";

const Main = () => {
  const [repositorios, setRepositorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const newRepo = useRef();

  useEffect(() => {
    const reposInStorage = localStorage.getItem("repos");
    if (reposInStorage) {
      setRepositorios(JSON.parse(reposInStorage));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("repos", JSON.stringify(repositorios));
  }, [repositorios]);

  const handleSubmit = useCallback(
    e => {
      e.preventDefault();
      if (!newRepo.current.value) {
        return;
      }

      const hasRepo = repositorios.find(
        repo => repo.name === newRepo.current.value
      );

      if (hasRepo) {
        setAlert(true);
        return;
      }

      setLoading(true);

      api
        .get(`repos/${newRepo.current.value}`)
        .then(response => {
          const newData = { name: response.data.full_name };
          setRepositorios([...repositorios, newData]);
          newRepo.current.value = "";
        })
        .catch(error => {
          console.error(error);
          setAlert(true);
        })
        .finally(() => setLoading(false));
    },
    [repositorios]
  );

  const handleDelete = useCallback(
    repoName => {
      const filteredRepos = repositorios.filter(repo => repo.name !== repoName);
      setRepositorios(filteredRepos);
    },
    [repositorios]
  );

  return (
    <S.Container>
      <h1>
        <FaGithub size={25} />
        Meus Repositórios
      </h1>

      <S.Form onSubmit={handleSubmit} $error={alert}>
        <input
          type="text"
          placeholder="Adicionar repositórios"
          ref={newRepo}
          onChange={() => setAlert(null)}
        />

        <S.SubmitButton loading={loading ? 1 : 0}>
          {loading ? (
            <FaSpinner color="#FFF" size={14} />
          ) : (
            <FaPlus color="#FFF" size={14} />
          )}
        </S.SubmitButton>
      </S.Form>

      <S.List>
        {repositorios.map(repo => (
          <li key={repo.name}>
            <span>
              <S.DeleteButton
                onClick={() => {
                  handleDelete(repo.name);
                }}
              >
                <FaTrash size={14} />
              </S.DeleteButton>
              {repo.name}
            </span>

            <Link to={`/repositorio/${encodeURIComponent(repo.name)}`}>
              <FaBars size={20} />
            </Link>
          </li>
        ))}
      </S.List>
    </S.Container>
  );
};

export default Main;
